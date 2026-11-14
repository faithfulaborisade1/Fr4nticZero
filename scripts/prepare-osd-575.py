"""Prepare the NASA OSD-575 glucose view, retaining the original sample labels.

Run from the repository root with python scripts/prepare-osd-575.py. The source
CSV is preserved unchanged under data/nasa-osd-575. Use --check to verify that
the checked-in JSON still matches the source byte-for-byte.
"""
import csv
import hashlib
import json
import re
import sys
from pathlib import Path

source = Path("data/nasa-osd-575/LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv")
target = Path("src/data/nasa-osd-575-glucose.json")
expected_sha256 = "5eb1e7f025dd8443a9e70111e62bc32afae3432753024489c5c013e401d709d9"
if hashlib.sha256(source.read_bytes()).hexdigest() != expected_sha256:
    raise SystemExit("NASA source hash does not match the recorded file")
with source.open(encoding="utf-8-sig", newline="") as handle:
    rows = list(csv.DictReader(handle))
expected_times = ["L-92", "L-44", "L-3", "R+1", "R+45", "R+82", "R+194"]
participants = {}
for row in rows:
    match = re.fullmatch(r"(C00[1-4])_serum_((?:L-\d+)|(?:R\+\d+))", row["Sample Name"])
    if not match:
        raise SystemExit(f"Unexpected sample label: {row['Sample Name']}")
    subject, timepoint = match.groups()
    value = row["glucose_value_milligram_per_deciliter"]
    if not value.isdecimal() or timepoint in participants.setdefault(subject, {}):
        raise SystemExit(f"Missing, invalid or duplicate glucose measurement: {row['Sample Name']}")
    participants[subject][timepoint] = int(value)
if sorted(participants) != ["C001", "C002", "C003", "C004"] or any(set(p) != set(expected_times) for p in participants.values()):
    raise SystemExit("Unexpected participants or sample timepoints")
result = {"sourceSha256": expected_sha256, "participants": [{"id": subject, "samples": [{"timepoint": time, "value": participants[subject][time]} for time in expected_times]} for subject in sorted(participants)]}
text = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
if "--check" in sys.argv:
    if not target.exists() or target.read_text(encoding="utf-8") != text:
        raise SystemExit("Derived data does not match source; regenerate it")
    print("Verified 28 glucose values against NASA source")
else:
    target.write_text(text, encoding="utf-8")
    print("Prepared 28 glucose values from NASA source")
