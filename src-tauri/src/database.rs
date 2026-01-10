use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::AppHandle;
use tauri::Manager;

pub struct Database {
    pub conn: Mutex<Connection>,
}

pub fn get_db_path(app: &AppHandle) -> PathBuf {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
    app_data_dir.join("kiroshi.db")
}

pub fn initialize(app: &AppHandle) -> Result<()> {
    let db_path = get_db_path(app);
    let conn = Connection::open(&db_path)?;

    // Create tables
    conn.execute_batch(
        "
        -- Races table
        CREATE TABLE IF NOT EXISTS races (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- PCs (Puntos de Control) table
        CREATE TABLE IF NOT EXISTS pcs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            race_id INTEGER NOT NULL,
            pc_number INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
            UNIQUE(race_id, pc_number)
        );

        -- Reference entries (rows in Hoja de Ruta) table
        CREATE TABLE IF NOT EXISTS reference_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pc_id INTEGER NOT NULL,
            hours INTEGER NOT NULL DEFAULT 0,
            minutes INTEGER NOT NULL DEFAULT 0,
            seconds INTEGER NOT NULL DEFAULT 0,
            centiseconds INTEGER NOT NULL DEFAULT 0,
            event_type TEXT NOT NULL CHECK(event_type IN ('LAR', 'REF', 'ADL', 'ATR', 'CVT', 'CVD', 'CVR')),
            speed INTEGER NOT NULL,
            extra_value REAL,
            is_control_zone INTEGER NOT NULL DEFAULT 0,
            order_index INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (pc_id) REFERENCES pcs(id) ON DELETE CASCADE
        );

        -- User preferences table (key-value store)
        CREATE TABLE IF NOT EXISTS user_preferences (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        -- Enable foreign key support
        PRAGMA foreign_keys = ON;

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_pcs_race_id ON pcs(race_id);
        CREATE INDEX IF NOT EXISTS idx_references_pc_id ON reference_entries(pc_id);
        CREATE INDEX IF NOT EXISTS idx_references_order ON reference_entries(pc_id, order_index);
        ",
    )?;

    // Store connection in app state
    app.manage(Database {
        conn: Mutex::new(conn),
    });

    Ok(())
}
