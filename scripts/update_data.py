"""
Data Update and Model Retrain Automation Script
Usage: python scripts/update_data.py [optional_path_to_new_csv]
"""
import sys
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.app.database.connection import SessionLocal
from backend.app.services.data_update_service import import_csv_observations, trigger_retrain_from_db

def main():
    db = SessionLocal()
    csv_file = sys.argv[1] if len(sys.argv) > 1 else None

    if csv_file:
        file_path = Path(csv_file)
        if not file_path.exists():
            print(f"Error: File '{csv_file}' not found.")
            sys.exit(1)
        print(f"Ingesting new dataset: {file_path.name}")
        with open(file_path, "rb") as f:
            content = f.read()
        res = import_csv_observations(db, content, file_path.name)
        print(f"Import status: {res}")

    print("Triggering model retrain with current database records...")
    train_res = trigger_retrain_from_db(db)
    if train_res.get("success"):
        print("Model retrain successful!")
        print("Metrics:", train_res.get("metrics", {}).get("metrics"))
    else:
        print("Retrain notice:", train_res.get("error"))

    db.close()

if __name__ == "__main__":
    main()
