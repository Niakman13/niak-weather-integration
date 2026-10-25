"""The engine's words follow Home Assistant's language. French is the source: each text is written in French in the code,
and `t()` gives it in the language set here, French when that language's dictionary lacks it.

Another language: add its dictionary (same keys as i18n_en.py) to DICTIONARIES. tests/test_i18n.py checks that none is missing.
Only words shown to people go through t(): states that automations read (« hausse », condition names) never change.
"""
from __future__ import annotations

import re
from contextlib import contextmanager
from collections.abc import Iterator

from .i18n_en import EN

DICTIONARIES: dict[str, dict[str, str]] = {"en": EN}
_language = "fr"


def set_language(language: str | None) -> None:
    """Home Assistant's language: French in French, its own dictionary when there is one, English otherwise."""
    global _language
    code = (language or "").lower().replace("_", "-").split("-")[0]
    _language = "fr" if code == "fr" or not code else code if code in DICTIONARIES else "en"


@contextmanager
def localized(language: str | None) -> Iterator[None]:
    """Temporarily render one view in `language`.

    A coordinator is shared by every dashboard user, while a card's language is
    a user preference.  Rendering is synchronous, so restoring the previous
    language here keeps one subscriber from leaking its language to another.
    """
    global _language
    previous = _language
    set_language(language)
    try:
        yield
    finally:
        _language = previous


def language() -> str:
    return _language


def decimal_comma() -> bool:
    """French writes 8,5; English 8.5."""
    return _language != "en"


_NAME = re.compile(r"\{(\w+)\}")


def t(french: str, **values: object) -> str:
    """A French text in the language set; `{name}` takes `values[name]`."""
    text = french if _language == "fr" else DICTIONARIES.get(_language, {}).get(french, french)
    return _NAME.sub(lambda m: str(values[m.group(1)]) if m.group(1) in values else m.group(0), text) if values else text


def N_(french: str) -> str:
    """Marks a French text kept in a table and translated where it is shown, with t(): the dictionary test finds it there too."""
    return french
