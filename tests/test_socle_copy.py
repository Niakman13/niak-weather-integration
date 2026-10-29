"""The shared « Hestia » panel copied into this brick hangs together (niak-ecosysteme/socle, copied by copier.sh).

The Python registers the panel under the shell's element name, which carries the socle's version; the compiled
screen must define that very name, or the panel stays blank. Plain file reads: no Home Assistant needed.
"""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
SOCLE = next(ROOT.glob("custom_components/*/socle.py"))
FRONTEND = SOCLE.parent / "frontend"


class SocleCopy(unittest.TestCase):
    def test_the_element_name_follows_the_socle_version_everywhere(self):
        python = SOCLE.read_text(encoding="utf-8")
        major, minor = re.search(r"^SOCLE_VERSION = \((\d+), (\d+)\)", python, re.M).groups()
        element = f"niak-socle-{major}-{minor}"
        self.assertIn(f'ELEMENT = "{element}"', python)
        self.assertIn(f"ELEMENT='{element}'", (ROOT / "frontend" / "socle" / "shell.ts").read_text(encoding="utf-8"))
        # Compiled after every copy: an old bundle would define the previous name.
        self.assertIn(element, (FRONTEND / "niak-socle.js").read_text(encoding="utf-8"))

    def test_the_fonts_are_served(self):
        for weight in (400, 500, 600, 700):
            self.assertTrue((FRONTEND / f"manrope-{weight}.ttf").is_file(), weight)


if __name__ == "__main__":
    unittest.main()
