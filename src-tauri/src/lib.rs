mod commands;
mod database;
mod models;
mod race_timer;

use commands::*;
use race_timer::*;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            database::initialize(app.handle())?;

            // Initialize race timer and start background thread
            let timer = RaceTimer::new();
            timer.start_background_thread(app.handle().clone());
            app.manage(timer);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Race commands
            get_all_races,
            get_race,
            create_race,
            update_race,
            delete_race,
            // PC commands
            get_pcs_by_race,
            get_pc,
            create_pc,
            delete_pc,
            get_next_pc,
            create_next_pc,
            // Reference commands
            get_references_by_pc,
            create_reference,
            update_reference,
            delete_reference,
            toggle_control_zone,
            // Preference commands
            get_preference,
            set_preference,
            // Race timer commands
            start_race_timer,
            stop_race_timer,
            toggle_race_timer,
            set_race_speed,
            set_correction_factor,
            adjust_correction_factor,
            record_odometer_snapshot,
            adjust_odometer,
            reset_odometer,
            reset_race_timer,
            full_reset_race_timer,
            get_race_timer_state,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
