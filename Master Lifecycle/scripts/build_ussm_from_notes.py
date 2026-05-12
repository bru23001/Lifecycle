#!/usr/bin/env python3
"""Build USSM - Unified Software Standards Manual from a notes dump."""
from __future__ import annotations

import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        type=Path,
        default=None,
        help="Source file containing raw USSM draft text",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output USSM path",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    src = args.input or (root / "00.Notes.md")
    out = args.output or (root / "USSM — Unified Software Standards Manual v1.0.md")

    text = src.read_text(encoding="utf-8")
    if "Unified Software Standards Manual" not in text:
        raise SystemExit(
            "Input does not appear to contain a USSM draft. "
            "Pass --input with the raw USSM source file."
        )
    lines = text.splitlines()

    start = 0
    if lines and "USSM" in lines[0] and "|" in lines[0] and not lines[0].strip().startswith("#"):
        start = 1
        if start < len(lines) and not lines[start].strip():
            start += 1

    body_lines = lines[start:]
    body = "\n".join(body_lines)

    if body.startswith("#Unified"):
        body = "# Unified Software Standards Manual (USSM) v1.0" + body.split("\n", 1)[1]

    body = body.replace("\u2e3b", "\n---\n")

    header = """---
title: Unified Software Standards Manual (USSM)
version: \"1.0\"
alignment: ISO/IEC 12207 · IEEE 29148
status: Draft — structure approved; content integration ongoing
classification: INTERNAL
---

"""

    final = header + body
    if not final.endswith("\n"):
        final += "\n"

    out.write_text(final, encoding="utf-8")
    print(f"Wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
