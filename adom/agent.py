from dotenv import load_dotenv
load_dotenv()

import os
import json
import time
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

ATOM_ENDPOINT = os.getenv("ATOM_ENDPOINT")

def load_signal():
    if not os.path.exists("signals.json"):
        return None
    with open("signals.json", "r") as f:
        signals = json.load(f)
        return signals[0] if signals else None

def is_valid(signal):
    if signal["status"] != "pending":
        return False
    expire_time = datetime.fromisoformat(signal["expires_at"])
    return datetime.utcnow() < expire_time

def post_signal(signal):
    try:
        print(f"[AGENT] 🚀 Sending signal to ATOM: {signal['id']}")
        res = requests.post(ATOM_ENDPOINT, json=signal)
        if res.status_code == 200:
            print(f"[AGENT] ✅ Signal posted.")
        else:
            print(f"[AGENT] ❌ Failed to post: {res.status_code}")
    except Exception as e:
        print(f"[AGENT] ❗ Error posting signal: {e}")

if __name__ == "__main__":
    while True:
        signal = load_signal()
        if signal and is_valid(signal):
            post_signal(signal)
        else:
            print("[AGENT] 💤 No valid signal or expired.")
        time.sleep(5)
