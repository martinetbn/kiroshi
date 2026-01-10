import { invoke } from "@tauri-apps/api/core";
import type {
  Race,
  PC,
  ReferenceEntry,
  CreateReferenceRequest,
  UpdateReferenceRequest,
  RaceTimerState,
} from "../types";

// ==================== RACE API ====================

export const getAllRaces = () => invoke<Race[]>("get_all_races");

export const getRace = (id: number) => invoke<Race>("get_race", { id });

export const createRace = (name: string) =>
  invoke<Race>("create_race", { name });

export const updateRace = (id: number, name: string) =>
  invoke<Race>("update_race", { id, name });

export const deleteRace = (id: number) => invoke<void>("delete_race", { id });

// ==================== PC API ====================

export const getPcsByRace = (raceId: number) =>
  invoke<PC[]>("get_pcs_by_race", { raceId });

export const getPc = (id: number) => invoke<PC>("get_pc", { id });

export const createPc = (raceId: number) =>
  invoke<PC>("create_pc", { raceId });

export const deletePc = (id: number) => invoke<void>("delete_pc", { id });

export const getNextPc = (pcId: number) =>
  invoke<PC | null>("get_next_pc", { pcId });

export const createNextPc = (currentPcId: number) =>
  invoke<PC>("create_next_pc", { currentPcId });

// ==================== REFERENCE API ====================

export const getReferencesByPc = (pcId: number) =>
  invoke<ReferenceEntry[]>("get_references_by_pc", { pcId });

export const createReference = (request: CreateReferenceRequest) =>
  invoke<ReferenceEntry>("create_reference", { request });

export const updateReference = (request: UpdateReferenceRequest) =>
  invoke<ReferenceEntry>("update_reference", { request });

export const deleteReference = (id: number) =>
  invoke<void>("delete_reference", { id });

export const toggleControlZone = (id: number) =>
  invoke<ReferenceEntry>("toggle_control_zone", { id });

// ==================== PREFERENCE API ====================

export const getPreference = (key: string) =>
  invoke<string | null>("get_preference", { key });

export const setPreference = (key: string, value: string) =>
  invoke<void>("set_preference", { key, value });

// ==================== RACE TIMER API ====================

export const startRaceTimer = () =>
  invoke<RaceTimerState>("start_race_timer");

export const stopRaceTimer = () =>
  invoke<RaceTimerState>("stop_race_timer");

export const toggleRaceTimer = () =>
  invoke<RaceTimerState>("toggle_race_timer");

export const setRaceSpeed = (speed: number) =>
  invoke<RaceTimerState>("set_race_speed", { speed });

export const setCorrectionFactor = (factor: number) =>
  invoke<RaceTimerState>("set_correction_factor", { factor });

export const adjustCorrectionFactor = (delta: number) =>
  invoke<RaceTimerState>("adjust_correction_factor", { delta });

export const recordOdometerSnapshot = (odometerMeters: number) =>
  invoke<RaceTimerState>("record_odometer_snapshot", { odometerMeters });

export const adjustOdometer = (delta: number) =>
  invoke<RaceTimerState>("adjust_odometer", { delta });

export const resetOdometer = () =>
  invoke<RaceTimerState>("reset_odometer");

export const resetRaceTimer = () =>
  invoke<RaceTimerState>("reset_race_timer");

export const fullResetRaceTimer = () =>
  invoke<RaceTimerState>("full_reset_race_timer");

export const getRaceTimerState = () =>
  invoke<RaceTimerState>("get_race_timer_state");

export const setRaceClockStart = (centiseconds: number) =>
  invoke<RaceTimerState>("set_race_clock_start", { centiseconds });
