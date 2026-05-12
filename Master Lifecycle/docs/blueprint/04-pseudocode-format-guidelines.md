# Pseudocode format guidelines

**Blueprint Phase 4 output** · **BP-001 Section 9**

**Full standard:** The complete procedure—pseudocode rules, per-file separation, translation to code, error handling, testing, and appendices—is **`Pseudocode to Code Conversion Guidelines.md`** in the Master Lifecycle folder (repository root `Master Lifecycle/` when this pack is used as-is).

This file is the **minimal gate artifact** for Blueprint Phase 4. Keep it synchronized with Sections **3–6** of that document when either changes.

---

## 1. Mandatory skeleton

```text
FUNCTION functionName(parameters)
  // Description
  IF condition THEN
    // Action
  ELSE
    // Alternative
  ENDIF
  RETURN value
END FUNCTION
```

---

## 2. Constructs (uppercase keywords)

Use language-independent constructs: **SEQUENCE**, **IF-THEN-ELSE** (`ENDIF`), **WHILE** (`ENDWHILE`), **REPEAT-UNTIL**, **FOR** (`ENDFOR`), **CASE** (`ENDCASE`). Close every multi-line block explicitly.

---

## 3. Traceability (every pseudocode file)

- `SOURCE: /path/to/original.ext`  
- `DOMAIN: _______` · `MODULE: _______`  

---

## 4. Error and observability notation

- EXCEPTION blocks or equivalent for recoverable errors  
- Named error categories where useful  
- Optional `LOG:` / `TRACE:` lines for critical paths  

---

## 5. Templates

Provide project-specific templates under `docs/blueprint/templates/` for backend services, UI components, and data models. Align naming with Phase 7 architecture outputs.

---

## 6. Gate

Formatting approved → proceed to Blueprint Phase 5 (phased implementation plan), then Phase 6 (backend pseudocode folders) after Phase 5 approval.

For **implementation-phase** translation discipline, follow **`Pseudocode to Code Conversion Guidelines.md`** Sections 7–11.
