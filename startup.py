# runner.py

import subprocess
import sys

if len(sys.argv) < 2:
    print("Usage: python runner.py <script1.py> <script2.py> ...")
    sys.exit(1)

scripts = sys.argv[1:]

for script in scripts:
    print(f"\n▶ Running: {script}")
    try:
        result = subprocess.run(["python", script], capture_output=True, text=True)
        print("Output:\n", result.stdout)
        if result.stderr:
            print("Errors:\n", result.stderr)
    except Exception as e:
        print(f"An error occurred while running {script}: {e}")
