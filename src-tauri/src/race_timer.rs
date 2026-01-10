use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Emitter};

const UPDATE_INTERVAL_MS: u64 = 50; // 50ms updates for smooth display

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RaceTimerState {
    pub raw_meters: f64,
    pub corrected_meters: f64,
    pub correction_factor: f64,
    pub current_speed: f64,
    pub is_running: bool,
    pub diff_snapshot: f64,
    pub odometer_meters: f64,
    // Race clock in centiseconds (hora de carrera)
    pub race_clock_centiseconds: i64,
}

impl Default for RaceTimerState {
    fn default() -> Self {
        Self {
            raw_meters: 0.0,
            corrected_meters: 0.0,
            correction_factor: 1042.0,
            current_speed: 0.0,
            is_running: false,
            diff_snapshot: 0.0,
            odometer_meters: 0.0,
            race_clock_centiseconds: 0,
        }
    }
}

struct TimerInternal {
    accumulated_meters: f64,
    correction_factor: f64,
    current_speed: f64,
    is_running: bool,
    diff_snapshot: f64,
    odometer_meters: f64,
    last_update: Option<Instant>,
    // Race clock tracking
    race_clock_start_centiseconds: i64, // LAR reference time in centiseconds
    race_clock_accumulated_centiseconds: f64, // Accumulated time since race start
}

impl Default for TimerInternal {
    fn default() -> Self {
        Self {
            accumulated_meters: 0.0,
            correction_factor: 1042.0,
            current_speed: 0.0,
            is_running: false,
            diff_snapshot: 0.0,
            odometer_meters: 0.0,
            last_update: None,
            race_clock_start_centiseconds: 0,
            race_clock_accumulated_centiseconds: 0.0,
        }
    }
}

impl TimerInternal {
    fn to_state(&self) -> RaceTimerState {
        let corrected = self.accumulated_meters * (self.correction_factor / 1000.0);
        // Calculate current race clock: start time + accumulated time
        let race_clock = self.race_clock_start_centiseconds + self.race_clock_accumulated_centiseconds as i64;
        RaceTimerState {
            raw_meters: self.accumulated_meters,
            corrected_meters: corrected,
            correction_factor: self.correction_factor,
            current_speed: self.current_speed,
            is_running: self.is_running,
            diff_snapshot: self.diff_snapshot,
            odometer_meters: self.odometer_meters,
            race_clock_centiseconds: race_clock,
        }
    }

    fn update(&mut self) {
        let now = Instant::now();

        if let Some(last) = self.last_update {
            let elapsed_secs = now.duration_since(last).as_secs_f64();

            if self.is_running {
                // Update race clock (always runs when race is running)
                // Convert seconds to centiseconds (1 sec = 100 centiseconds)
                self.race_clock_accumulated_centiseconds += elapsed_secs * 100.0;

                // Update odometer only if speed > 0
                if self.current_speed > 0.0 {
                    // Speed is km/h, convert to m/s: speed / 3.6
                    let meters_per_second = self.current_speed / 3.6;
                    self.accumulated_meters += meters_per_second * elapsed_secs;
                }
            }
        }

        self.last_update = Some(now);
    }
}

pub struct RaceTimer {
    internal: Arc<Mutex<TimerInternal>>,
    thread_running: Arc<Mutex<bool>>,
}

impl RaceTimer {
    pub fn new() -> Self {
        Self {
            internal: Arc::new(Mutex::new(TimerInternal::default())),
            thread_running: Arc::new(Mutex::new(false)),
        }
    }

    pub fn start_background_thread(&self, app_handle: AppHandle) {
        let internal = Arc::clone(&self.internal);
        let thread_running = Arc::clone(&self.thread_running);

        // Check if thread is already running
        {
            let mut running = thread_running.lock().unwrap();
            if *running {
                return;
            }
            *running = true;
        }

        thread::spawn(move || {
            let interval = Duration::from_millis(UPDATE_INTERVAL_MS);

            loop {
                // Check if we should stop
                {
                    let running = thread_running.lock().unwrap();
                    if !*running {
                        break;
                    }
                }

                // Update timer and get state
                let state = {
                    let mut timer = internal.lock().unwrap();
                    timer.update();
                    timer.to_state()
                };

                // Emit event to frontend
                let _ = app_handle.emit("race-timer-update", &state);

                thread::sleep(interval);
            }
        });
    }

    pub fn stop_background_thread(&self) {
        let mut running = self.thread_running.lock().unwrap();
        *running = false;
    }

    pub fn get_state(&self) -> RaceTimerState {
        let timer = self.internal.lock().unwrap();
        timer.to_state()
    }

    pub fn start(&self) {
        let mut timer = self.internal.lock().unwrap();
        timer.is_running = true;
        timer.last_update = Some(Instant::now());
    }

    pub fn stop(&self) {
        let mut timer = self.internal.lock().unwrap();
        // Update one last time to capture final meters
        timer.update();
        timer.is_running = false;
    }

    pub fn toggle(&self) -> bool {
        let mut timer = self.internal.lock().unwrap();
        if timer.is_running {
            timer.update();
            timer.is_running = false;
        } else {
            timer.is_running = true;
            timer.last_update = Some(Instant::now());
        }
        timer.is_running
    }

    pub fn set_speed(&self, speed: f64) {
        let mut timer = self.internal.lock().unwrap();
        // Update with old speed first
        timer.update();
        timer.current_speed = speed;
    }

    pub fn set_correction_factor(&self, factor: f64) {
        let mut timer = self.internal.lock().unwrap();
        timer.correction_factor = factor;
    }

    pub fn adjust_correction_factor(&self, delta: f64) -> f64 {
        let mut timer = self.internal.lock().unwrap();
        timer.correction_factor += delta;
        timer.correction_factor
    }

    pub fn record_snapshot(&self, odometer_meters: f64) -> f64 {
        let mut timer = self.internal.lock().unwrap();
        timer.odometer_meters = odometer_meters;
        let corrected = timer.accumulated_meters * (timer.correction_factor / 1000.0);
        timer.diff_snapshot = odometer_meters - corrected;
        timer.diff_snapshot
    }

    pub fn set_odometer(&self, meters: f64) {
        let mut timer = self.internal.lock().unwrap();
        timer.odometer_meters = meters;
    }

    pub fn adjust_odometer(&self, delta: f64) -> f64 {
        let mut timer = self.internal.lock().unwrap();
        timer.odometer_meters += delta;
        // Also update the diff snapshot
        let corrected = timer.accumulated_meters * (timer.correction_factor / 1000.0);
        timer.diff_snapshot = timer.odometer_meters - corrected;
        timer.odometer_meters
    }

    pub fn reset(&self) {
        let mut timer = self.internal.lock().unwrap();
        timer.accumulated_meters = 0.0;
        timer.is_running = false;
        timer.last_update = None;
        timer.diff_snapshot = 0.0;
        // Keep correction_factor, current_speed, and odometer_meters
    }

    pub fn reset_odometer(&self) {
        let mut timer = self.internal.lock().unwrap();
        timer.odometer_meters = 0.0;
        // Update diff snapshot
        let corrected = timer.accumulated_meters * (timer.correction_factor / 1000.0);
        timer.diff_snapshot = timer.odometer_meters - corrected;
    }

    pub fn full_reset(&self) {
        let mut timer = self.internal.lock().unwrap();
        *timer = TimerInternal::default();
    }

    pub fn set_race_clock_start(&self, centiseconds: i64) {
        let mut timer = self.internal.lock().unwrap();
        timer.race_clock_start_centiseconds = centiseconds;
        timer.race_clock_accumulated_centiseconds = 0.0;
    }
}

// Tauri commands
use tauri::State;

#[tauri::command]
pub fn start_race_timer(timer: State<RaceTimer>) -> RaceTimerState {
    timer.start();
    timer.get_state()
}

#[tauri::command]
pub fn stop_race_timer(timer: State<RaceTimer>) -> RaceTimerState {
    timer.stop();
    timer.get_state()
}

#[tauri::command]
pub fn toggle_race_timer(timer: State<RaceTimer>) -> RaceTimerState {
    timer.toggle();
    timer.get_state()
}

#[tauri::command]
pub fn set_race_speed(timer: State<RaceTimer>, speed: f64) -> RaceTimerState {
    timer.set_speed(speed);
    timer.get_state()
}

#[tauri::command]
pub fn set_correction_factor(timer: State<RaceTimer>, factor: f64) -> RaceTimerState {
    timer.set_correction_factor(factor);
    timer.get_state()
}

#[tauri::command]
pub fn adjust_correction_factor(timer: State<RaceTimer>, delta: f64) -> RaceTimerState {
    timer.adjust_correction_factor(delta);
    timer.get_state()
}

#[tauri::command]
pub fn record_odometer_snapshot(timer: State<RaceTimer>, odometer_meters: f64) -> RaceTimerState {
    timer.record_snapshot(odometer_meters);
    timer.get_state()
}

#[tauri::command]
pub fn adjust_odometer(timer: State<RaceTimer>, delta: f64) -> RaceTimerState {
    timer.adjust_odometer(delta);
    timer.get_state()
}

#[tauri::command]
pub fn reset_odometer(timer: State<RaceTimer>) -> RaceTimerState {
    timer.reset_odometer();
    timer.get_state()
}

#[tauri::command]
pub fn reset_race_timer(timer: State<RaceTimer>) -> RaceTimerState {
    timer.reset();
    timer.get_state()
}

#[tauri::command]
pub fn full_reset_race_timer(timer: State<RaceTimer>) -> RaceTimerState {
    timer.full_reset();
    timer.get_state()
}

#[tauri::command]
pub fn get_race_timer_state(timer: State<RaceTimer>) -> RaceTimerState {
    timer.get_state()
}

#[tauri::command]
pub fn set_race_clock_start(timer: State<RaceTimer>, centiseconds: i64) -> RaceTimerState {
    timer.set_race_clock_start(centiseconds);
    timer.get_state()
}
