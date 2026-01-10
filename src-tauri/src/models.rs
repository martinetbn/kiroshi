use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Race {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PC {
    pub id: i64,
    pub race_id: i64,
    pub pc_number: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReferenceEntry {
    pub id: i64,
    pub pc_id: i64,
    pub hours: i32,
    pub minutes: i32,
    pub seconds: i32,
    pub centiseconds: i32,
    pub event_type: String,
    pub speed: i32,
    pub extra_value: Option<f64>,
    pub is_control_zone: bool,
    pub order_index: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateReferenceRequest {
    pub pc_id: i64,
    pub hours: i32,
    pub minutes: i32,
    pub seconds: i32,
    pub centiseconds: i32,
    pub event_type: String,
    pub speed: i32,
    pub extra_value: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateReferenceRequest {
    pub id: i64,
    pub hours: i32,
    pub minutes: i32,
    pub seconds: i32,
    pub centiseconds: i32,
    pub event_type: String,
    pub speed: i32,
    pub extra_value: Option<f64>,
}
