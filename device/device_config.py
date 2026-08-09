import json
import os
import sys

CONFIG_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "device_config.json"
)

DEFAULT_CONFIG = {
    "api_base_url": "http://127.0.0.1:8000/api",
    "api_key": "PASTE_YOUR_DEVICE_API_KEY_HERE",
    "schedule_poll_seconds": 20
}


def load_config():
    """
    Reads device_config.json next to this file. If it doesn't exist yet,
    a template is created and the app exits so the operator can fill it
    in — api_key comes from the admin dashboard's Devices page, shown
    exactly once, right after the device is registered there.
    """

    if not os.path.exists(CONFIG_PATH):

        with open(CONFIG_PATH, "w") as f:
            json.dump(DEFAULT_CONFIG, f, indent=4)

        print("=============================================")
        print("No device_config.json found — a template was")
        print(f"created at:\n  {CONFIG_PATH}")
        print("Fill in api_base_url and api_key (from the admin")
        print("dashboard's Devices page) and restart the app.")
        print("=============================================")

        sys.exit(1)

    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)

    if (
        not config.get("api_key")
        or config["api_key"] == DEFAULT_CONFIG["api_key"]
    ):

        print("=============================================")
        print("device_config.json exists but api_key is not set.")
        print(f"Edit it at:\n  {CONFIG_PATH}")
        print("=============================================")

        sys.exit(1)

    config.setdefault(
        "schedule_poll_seconds",
        DEFAULT_CONFIG["schedule_poll_seconds"]
    )

    return config
