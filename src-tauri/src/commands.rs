use crate::database::Database;
use crate::models::{CreateReferenceRequest, PC, Race, ReferenceEntry, UpdateReferenceRequest};
use tauri::State;

// ==================== RACE COMMANDS ====================

#[tauri::command]
pub fn get_all_races(db: State<Database>) -> Result<Vec<Race>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM races ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let races = stmt
        .query_map([], |row| {
            Ok(Race {
                id: row.get(0)?,
                name: row.get(1)?,
                created_at: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(races)
}

#[tauri::command]
pub fn get_race(db: State<Database>, id: i64) -> Result<Race, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM races WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(Race {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_race(db: State<Database>, name: String) -> Result<Race, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO races (name) VALUES (?1)",
        [&name],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM races WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(Race {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_race(db: State<Database>, id: i64, name: String) -> Result<Race, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE races SET name = ?1 WHERE id = ?2", [&name, &id.to_string()])
        .map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM races WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(Race {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_race(db: State<Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    // Foreign key cascade will delete associated PCs and references
    conn.execute("DELETE FROM races WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ==================== PC COMMANDS ====================

#[tauri::command]
pub fn get_pcs_by_race(db: State<Database>, race_id: i64) -> Result<Vec<PC>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, race_id, pc_number, created_at FROM pcs WHERE race_id = ?1 ORDER BY pc_number ASC")
        .map_err(|e| e.to_string())?;

    let pcs = stmt
        .query_map([race_id], |row| {
            Ok(PC {
                id: row.get(0)?,
                race_id: row.get(1)?,
                pc_number: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(pcs)
}

#[tauri::command]
pub fn get_pc(db: State<Database>, id: i64) -> Result<PC, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, race_id, pc_number, created_at FROM pcs WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(PC {
            id: row.get(0)?,
            race_id: row.get(1)?,
            pc_number: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_pc(db: State<Database>, race_id: i64) -> Result<PC, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get the next pc_number for this race
    let next_number: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(pc_number), 0) + 1 FROM pcs WHERE race_id = ?1",
            [race_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO pcs (race_id, pc_number) VALUES (?1, ?2)",
        [race_id, next_number as i64],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    let mut stmt = conn
        .prepare("SELECT id, race_id, pc_number, created_at FROM pcs WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(PC {
            id: row.get(0)?,
            race_id: row.get(1)?,
            pc_number: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_pc(db: State<Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    // Foreign key cascade will delete associated references
    conn.execute("DELETE FROM pcs WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_next_pc(db: State<Database>, pc_id: i64) -> Result<Option<PC>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // First get the current PC to find race_id and pc_number
    let current: PC = conn
        .query_row(
            "SELECT id, race_id, pc_number, created_at FROM pcs WHERE id = ?1",
            [pc_id],
            |row| {
                Ok(PC {
                    id: row.get(0)?,
                    race_id: row.get(1)?,
                    pc_number: row.get(2)?,
                    created_at: row.get(3)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    // Find the next PC by number
    let mut stmt = conn
        .prepare("SELECT id, race_id, pc_number, created_at FROM pcs WHERE race_id = ?1 AND pc_number > ?2 ORDER BY pc_number ASC LIMIT 1")
        .map_err(|e| e.to_string())?;

    let result = stmt
        .query_row([current.race_id, current.pc_number as i64], |row| {
            Ok(PC {
                id: row.get(0)?,
                race_id: row.get(1)?,
                pc_number: row.get(2)?,
                created_at: row.get(3)?,
            })
        });

    match result {
        Ok(pc) => Ok(Some(pc)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn create_next_pc(db: State<Database>, current_pc_id: i64) -> Result<PC, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get the current PC's race_id
    let race_id: i64 = conn
        .query_row("SELECT race_id FROM pcs WHERE id = ?1", [current_pc_id], |row| {
            row.get(0)
        })
        .map_err(|e| e.to_string())?;

    // Get the next pc_number for this race
    let next_number: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(pc_number), 0) + 1 FROM pcs WHERE race_id = ?1",
            [race_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO pcs (race_id, pc_number) VALUES (?1, ?2)",
        [race_id, next_number as i64],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    let mut stmt = conn
        .prepare("SELECT id, race_id, pc_number, created_at FROM pcs WHERE id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(PC {
            id: row.get(0)?,
            race_id: row.get(1)?,
            pc_number: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map_err(|e| e.to_string())
}

// ==================== REFERENCE COMMANDS ====================

#[tauri::command]
pub fn get_references_by_pc(db: State<Database>, pc_id: i64) -> Result<Vec<ReferenceEntry>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, pc_id, hours, minutes, seconds, centiseconds, event_type, speed, extra_value, is_control_zone, order_index, created_at
             FROM reference_entries
             WHERE pc_id = ?1
             ORDER BY order_index ASC",
        )
        .map_err(|e| e.to_string())?;

    let refs = stmt
        .query_map([pc_id], |row| {
            Ok(ReferenceEntry {
                id: row.get(0)?,
                pc_id: row.get(1)?,
                hours: row.get(2)?,
                minutes: row.get(3)?,
                seconds: row.get(4)?,
                centiseconds: row.get(5)?,
                event_type: row.get(6)?,
                speed: row.get(7)?,
                extra_value: row.get(8)?,
                is_control_zone: row.get::<_, i32>(9)? != 0,
                order_index: row.get(10)?,
                created_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(refs)
}

#[tauri::command]
pub fn create_reference(db: State<Database>, request: CreateReferenceRequest) -> Result<ReferenceEntry, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get the next order_index for this PC
    let next_index: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(order_index), -1) + 1 FROM reference_entries WHERE pc_id = ?1",
            [request.pc_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO reference_entries (pc_id, hours, minutes, seconds, centiseconds, event_type, speed, extra_value, order_index)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        rusqlite::params![
            request.pc_id,
            request.hours,
            request.minutes,
            request.seconds,
            request.centiseconds,
            request.event_type,
            request.speed,
            request.extra_value,
            next_index
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    let mut stmt = conn
        .prepare(
            "SELECT id, pc_id, hours, minutes, seconds, centiseconds, event_type, speed, extra_value, is_control_zone, order_index, created_at
             FROM reference_entries WHERE id = ?1",
        )
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(ReferenceEntry {
            id: row.get(0)?,
            pc_id: row.get(1)?,
            hours: row.get(2)?,
            minutes: row.get(3)?,
            seconds: row.get(4)?,
            centiseconds: row.get(5)?,
            event_type: row.get(6)?,
            speed: row.get(7)?,
            extra_value: row.get(8)?,
            is_control_zone: row.get::<_, i32>(9)? != 0,
            order_index: row.get(10)?,
            created_at: row.get(11)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_reference(db: State<Database>, request: UpdateReferenceRequest) -> Result<ReferenceEntry, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE reference_entries
         SET hours = ?1, minutes = ?2, seconds = ?3, centiseconds = ?4, event_type = ?5, speed = ?6, extra_value = ?7
         WHERE id = ?8",
        rusqlite::params![
            request.hours,
            request.minutes,
            request.seconds,
            request.centiseconds,
            request.event_type,
            request.speed,
            request.extra_value,
            request.id
        ],
    )
    .map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, pc_id, hours, minutes, seconds, centiseconds, event_type, speed, extra_value, is_control_zone, order_index, created_at
             FROM reference_entries WHERE id = ?1",
        )
        .map_err(|e| e.to_string())?;

    stmt.query_row([request.id], |row| {
        Ok(ReferenceEntry {
            id: row.get(0)?,
            pc_id: row.get(1)?,
            hours: row.get(2)?,
            minutes: row.get(3)?,
            seconds: row.get(4)?,
            centiseconds: row.get(5)?,
            event_type: row.get(6)?,
            speed: row.get(7)?,
            extra_value: row.get(8)?,
            is_control_zone: row.get::<_, i32>(9)? != 0,
            order_index: row.get(10)?,
            created_at: row.get(11)?,
        })
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_reference(db: State<Database>, id: i64) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM reference_entries WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn toggle_control_zone(db: State<Database>, id: i64) -> Result<ReferenceEntry, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE reference_entries SET is_control_zone = NOT is_control_zone WHERE id = ?1",
        [id],
    )
    .map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, pc_id, hours, minutes, seconds, centiseconds, event_type, speed, extra_value, is_control_zone, order_index, created_at
             FROM reference_entries WHERE id = ?1",
        )
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
        Ok(ReferenceEntry {
            id: row.get(0)?,
            pc_id: row.get(1)?,
            hours: row.get(2)?,
            minutes: row.get(3)?,
            seconds: row.get(4)?,
            centiseconds: row.get(5)?,
            event_type: row.get(6)?,
            speed: row.get(7)?,
            extra_value: row.get(8)?,
            is_control_zone: row.get::<_, i32>(9)? != 0,
            order_index: row.get(10)?,
            created_at: row.get(11)?,
        })
    })
    .map_err(|e| e.to_string())
}

// ==================== PREFERENCE COMMANDS ====================

#[tauri::command]
pub fn get_preference(db: State<Database>, key: String) -> Result<Option<String>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM user_preferences WHERE key = ?1")
        .map_err(|e| e.to_string())?;

    let result = stmt.query_row([&key], |row| row.get::<_, String>(0));

    match result {
        Ok(value) => Ok(Some(value)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn set_preference(db: State<Database>, key: String, value: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO user_preferences (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [&key, &value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
