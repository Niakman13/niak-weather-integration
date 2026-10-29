"""The setup and options dialogs and the entity names in German: the same keys, {names} and line breaks as English."""
from __future__ import annotations

import json
import re
from pathlib import Path

FOLDER = Path(__file__).parent.parent / "custom_components" / "hestia_weather" / "translations"


def flat(node: dict, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    for key, value in node.items():
        out.update(flat(value, f"{prefix}{key}.") if isinstance(value, dict) else {f"{prefix}{key}": value})
    return out


EN = flat(json.loads((FOLDER / "en.json").read_text(encoding="utf-8")))
DE = flat(json.loads((FOLDER / "de.json").read_text(encoding="utf-8")))


def test_german_has_the_same_keys_as_english():
    assert sorted(EN.keys() ^ DE.keys()) == []


def test_german_keeps_the_same_names_and_layout():
    names = lambda s: sorted(re.findall(r"\{(\w+)\}", s))
    assert [k for k in EN if names(EN[k]) != names(DE[k]) or EN[k].count("\n") != DE[k].count("\n") or EN[k].count("**") != DE[k].count("**")] == []
