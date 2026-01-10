mod commands;
mod database;
mod models;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            database::initialize(app.handle())?;
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
