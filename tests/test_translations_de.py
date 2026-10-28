"""The setup and options dialogs in German: the same keys, {names} and line breaks as English."""
from __future__ import annotations

import json
import re
from pathlib import Path

FOLDER = Path(__file__).parent.parent / "custom_components" / "niak_weather" / "translations"


def flat(node: dict, prefix: str = "") -> dict[str, str]:
    out: dict[str, str] = {}
    for key, value in node.items():
        out.update(flat(value, f"{prefix}{key}.") if isinstance(value, dict) else {f"{prefix}{key}": value})
    return out


EN = {k: v for k, v in flat(json.loads((FOLDER / "en.json").read_text(encoding="utf-8"))).items() if not k.startswith("entity.")}
DE = flat(json.loads((FOLDER / "de.json").read_text(encoding="utf-8")))


def test_german_has_the_same_keys_as_english_for_the_dialogs():
    assert sorted(EN.keys() ^ DE.keys()) == []


def test_german_keeps_the_same_names_and_layout():
    names = lambda s: sorted(re.findall(r"\{(\w+)\}", s))
    assert [k for k in EN if names(EN[k]) != names(DE[k]) or EN[k].count("\n") != DE[k].count("\n") or EN[k].count("**") != DE[k].count("**")] == []
