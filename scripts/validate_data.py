"""
CLI Tool to validate an input groundwater CSV file.
Usage: python scripts/validate_data.py [path_to_csv]
"""
import sys
from pathlib import Path
import pandas as pd

# Add root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from ml.data_validation import validate_dataframe

def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else str(BASE_DIR / "data" / "sample" / "sample_observations.csv")
    print(f"Validating dataset: {csv_path}")

    if not Path(csv_path).exists():
        print(f"Error: File does not exist at {csv_path}")
        sys.exit(1)

    df = pd.read_csv(csv_path)
    is_valid, issues, clean_df = validate_dataframe(df)

    print(f"\n--- Validation Report ---")
    print(f"Result: {'PASSED [VALID]' if is_valid else 'FAILED [INVALID]'}")
    print(f"Total Rows Ingested: {len(df)}")
    print(f"Cleaned Rows Valid: {len(clean_df)}")
    
    if issues:
        print("\nNotices & Corrections:")
        for idx, issue in enumerate(issues, 1):
            print(f"  {idx}. {issue}")
    else:
        print("No structural or boundary issues detected.")

if __name__ == "__main__":
    main()
