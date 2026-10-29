"""The engine is tested on its own, without Home Assistant: it is imported as the top-level package `engine`."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "custom_components" / "hestia_weather"))
