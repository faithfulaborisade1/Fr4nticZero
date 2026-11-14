"""Derive research-view data from preserved NASA source files; --check verifies it."""
import csv
import hashlib
import json
import math
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

files = {
 "metabolic": ("data/nasa-osd-575/LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv", "5eb1e7f025dd8443a9e70111e62bc32afae3432753024489c5c013e401d709d9"),
 "blood": ("data/nasa-osd-569/LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv", "32e4f9c97d3b636b5d5c2e72dab8c4d3319dee64c437508b092dad04603b2b8f"),
 "immune": ("data/nasa-osd-575/LSDS-8_Multiplex_serum_immune_EvePanel_TRANSFORMED.csv", "efa8fb807e3b7e363df47f64f48d03c57d2397daf8fd22afc0ea4335d5d3d53e"),
 "cardiovascular": ("data/nasa-osd-575/LSDS-8_Multiplex_serum_cardiovascular_EvePanel_TRANSFORMED.csv", "fdba6c3ce45401c12ca9b699fa375303793959aa0391e2f3c722f354d9cfc75c"),
 "temperature": ("data/nasa-eda-rr1/temperature.json", "f3add507d62943d40e219ae9ea39a183c7ee58bb08196e76c6f9a6a26bf24477"),
 "humidity": ("data/nasa-eda-rr1/humidity.json", "7e5e0056d73150aae0a07fd61b0dd747a36a9618ca5a9189a154274348887d78"),
 "co2": ("data/nasa-eda-rr1/co2.json", "aa924c3e36a85ce7b38e963e12b9472573d56272fe35016aa621d231b273788a"),
}
metrics = [
 ("glucose", "Glucose", "mg/dL", "metabolic", "glucose_value_milligram_per_deciliter"),
 ("sodium", "Sodium", "mmol/L", "metabolic", "sodium_value_millimol_per_liter"),
 ("potassium", "Potassium", "mmol/L", "metabolic", "potassium_value_millimol_per_liter"),
 ("calcium", "Calcium", "mg/dL", "metabolic", "calcium_value_milligram_per_deciliter"),
 ("wbc", "White blood cell count", "thousand/µL", "blood", "white_blood_cell_count_value_thousand_per_microliter"),
 ("rbc", "Red blood cell count", "million/µL", "blood", "red_blood_cell_count_value_million_per_microliter"),
 ("platelets", "Platelet count", "thousand/µL", "blood", "platelet_count_value_thousand_per_microliter"),
 ("lymphocytes", "Absolute lymphocytes", "cells/µL", "blood", "absolute_lymphocytes_value_cells_per_microliter"),
 ("il6", "Interleukin-6 (IL-6)", "pg/mL", "immune", "il_6_concentration_picogram_per_milliliter"),
 ("il10", "Interleukin-10 (IL-10)", "pg/mL", "immune", "il_10_concentration_picogram_per_milliliter"),
 ("crp", "C-reactive protein (CRP)", "pg/mL", "cardiovascular", "crp_concentration_picogram_per_milliliter"),
]
expected_times = ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"]
raw = {}
for key, (filename, digest) in files.items():
 path = Path(filename)
 if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
  raise SystemExit(f"Source hash mismatch: {filename}")
 if key in ("temperature", "humidity", "co2"):
  raw[key] = json.loads(path.read_bytes())
 else:
  with path.open(encoding="utf-8-sig", newline="") as f:
   raw[key] = list(csv.DictReader(f))

output_metrics = []
for key, label, unit, source, column in metrics:
 subjects = {}
 for row in raw[source]:
  match = re.fullmatch(r"(C00[1-4])_(?:serum|whole-blood)_((?:L-\d+)|(?:R\+\d+))(?:_cbc)?", row["Sample Name"])
  if not match: raise SystemExit(f"Unexpected sample: {row['Sample Name']}")
  subject, timepoint = match.groups()
  value = float(row[column])
  if not math.isfinite(value) or timepoint in subjects.setdefault(subject, {}): raise SystemExit("Invalid or duplicate value")
  subjects[subject][timepoint] = value
 if sorted(subjects) != ["C001", "C002", "C003", "C004"] or any(set(v) != set(expected_times) for v in subjects.values()): raise SystemExit(f"Unexpected samples in {key}")
 output_metrics.append({"id": key, "label": label, "unit": unit, "source": source, "participants": [{"id": s, "samples": [{"timepoint": t, "value": subjects[s][t]} for t in expected_times]} for s in sorted(subjects)]})
telemetry = []
for key, label, unit in [("temperature", "Temperature", "°C"), ("humidity", "Relative humidity", "%"), ("co2", "Carbon dioxide", "ppm")]:
 points = raw[key]
 if len(points) != 289: raise SystemExit(f"Unexpected {key} telemetry count")
 start = datetime.fromisoformat("2014-09-25T00:00:00+00:00")
 for index, point in enumerate(points):
  if datetime.fromisoformat(point["time"].replace("Z", "+00:00")) != start + timedelta(minutes=5*index) or not math.isfinite(point[key + "_iss"]): raise SystemExit(f"Unexpected {key} telemetry point {index}")
 telemetry.append({"id":key,"label":label,"unit":unit,"points":[{"time":p["time"],"value":p[key + "_iss"]} for p in points]})
result = {"sources":{key: digest for key, (_, digest) in files.items()},"metrics":output_metrics,"telemetry":telemetry}
target = Path("src/data/nasa-research-data.json")
text = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
if "--check" in sys.argv:
 if not target.exists() or target.read_text(encoding="utf-8") != text: raise SystemExit("Derived research data does not match sources")
 print("Verified 308 lab values and 867 telemetry points against NASA sources")
else:
 target.write_text(text, encoding="utf-8")
 print("Prepared 308 lab values and 867 telemetry points from NASA sources")
