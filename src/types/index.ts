export interface Race {
  id: number;
  name: string;
  created_at: string;
}

export interface PC {
  id: number;
  race_id: number;
  pc_number: number;
  created_at: string;
}

export interface ReferenceEntry {
  id: number;
  pc_id: number;
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
  event_type: EventType;
  speed: number;
  extra_value: number | null;
  is_control_zone: boolean;
  order_index: number;
  created_at: string;
}

export type EventType = "LAR" | "REF" | "ADL" | "ATR" | "CVT" | "CVD" | "CVR";

export interface CreateReferenceRequest {
  pc_id: number;
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
  event_type: EventType;
  speed: number;
  extra_value?: number;
}

export interface UpdateReferenceRequest {
  id: number;
  hours: number;
  minutes: number;
  seconds: number;
  centiseconds: number;
  event_type: EventType;
  speed: number;
  extra_value?: number;
}

export interface RaceTimerState {
  raw_meters: number;
  corrected_meters: number;
  correction_factor: number;
  current_speed: number;
  is_running: boolean;
  diff_snapshot: number;
  odometer_meters: number;
  race_clock_centiseconds: number;
}
