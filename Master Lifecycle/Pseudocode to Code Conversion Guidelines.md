# Pseudocode to Code Conversion Guidelines

**Classification:** Keep — standard procedure for writing blueprint pseudocode and translating it to implementation.

**Procedure ID:** P2C-001.

**Applies to:** Phase 8 — Development Preparation (pseudocode bodies, review) · Phase 9 — Implementation (translation to real code) · Blueprint Phases 4, 6, and 7 (format → backend/frontend pseudocode) per **BP-001** (`Universal Blueprint Extraction — BP-001 Procedure.md`).

**Companion artifact:** Blueprint Phase 4 delivers `docs/blueprint/04-pseudocode-format-guidelines.md` (synced with Section 5 of this document for gate approvals).

**Gate context:** Supports **G6 — Development Ready** when pseudocode is part of Phase 8 preparation and supports Phase 9 implementation evidence when approved pseudocode is translated into code.

P2C-001 does **not** replace BP-001, Phase 8, Phase 9, the Development Plan, or `Unit Test and Pseudocode Writing Guidelines.md`. It is the controlled pseudocode format and translation standard used by those procedures.

---

## 1. Purpose

Provide a single standard for:

1. **Writing** pseudocode that is language-independent, readable, and traceable to source.
2. **Separating** pseudocode per file/module consistent with architecture.
3. **Translating** pseudocode into target-language code without drift from algorithm intent.
4. **Handling** errors, validation, and observability where pseudocode is silent.
5. **Verifying** behavior through incremental testing.

Moving from pseudocode to implementation should be **mechanical translation** plus **explicitly documented** language idioms—not reinvention.

---

## 2. Principles

| Principle | Requirement |
| --- | --- |
| Language independence | Use uppercase constructs (Section 4), domain vocabulary, no target-language syntax in pseudocode. |
| Full logic | Pseudocode must describe complete algorithmic logic so each line maps to code; gaps must be marked `UNKNOWN: _______`. |
| One pseudocode file per source file | Keep each `.pseudo.md` aligned to one primary source path (`SOURCE`), unless a template explicitly combines modules. |
| Traceability | Every pseudocode file lists `SOURCE`, domain/module tags, and tier where applicable (Phase 7 templates). |
| Integrity | Preserved control flow, data relationships, and asymptotic behavior unless an ADR or ticket documents an intentional change. |

---

## 3. How to write pseudocode

1. **Capitalize** the leading keyword of major constructs (see Section 4).
2. **One logical statement per line** (compound ideas split across lines).
3. **Indent** to show nesting; depth reflects structure, not optional style.
4. **Close** multi-line blocks with explicit end markers (`ENDIF`, `ENDWHILE`, `ENDFOR`, `ENDCASE`, etc.).
5. **Stay language-independent** — describe *what*, not `+=` vs `.push()` unless documenting an existing line-level mapping.
6. **Use problem-domain names** — e.g. “Append family name to given name for display” rather than `name = first + last` unless reproducing a legacy formula.
7. **Agree detail level** before large batches: **(1)** detailed step-by-step, or **(2)** concise readable blocks for senior reviewers.
8. **Open with intent** — short description of responsibility; **after** the pseudocode, add a brief narrative explanation if helpful.

---

## 4. Main constructs

Pseudocode expresses control flow with **six core constructs** (keywords in **UPPERCASE**):

| Construct | Role |
| --- | --- |
| SEQUENCE | Linear steps executed in order. |
| WHILE | Loop; condition tested before each iteration. |
| REPEAT-UNTIL | Loop; condition tested after each iteration. |
| FOR | Definite iteration over bounds or collection. |
| IF-THEN-ELSE | Conditional branching. |
| CASE | Multi-branch selection (generalized IF). |

### 4.1 Vocabulary (common verbs)

| Role | Keywords (examples) |
| --- | --- |
| Input | READ, OBTAIN, GET |
| Output | PRINT, DISPLAY, SHOW |
| Compute | COMPUTE, CALCULATE, DETERMINE |
| Initialize | SET, INIT |
| Increment / decrement | INCREMENT, BUMP / DECREMENT |

### 4.2 Patterns

**FOR**

```text
FOR iteration bounds
  sequence
ENDFOR
```

**WHILE**

```text
WHILE condition
  sequence
ENDWHILE
```

**REPEAT-UNTIL**

```text
REPEAT
  sequence
UNTIL condition
```

**CASE**

```text
CASE expression OF
  condition 1 : sequence 1
  condition 2 : sequence 2
  ...
  OTHERS :
    default sequence
ENDCASE
```

**IF-THEN-ELSE**

```text
IF condition THEN
  sequence 1
ELSE
  sequence 2
ENDIF
```

### 4.3 Exception handling (notation)

Use structured blocks when flows can fail or must recover:

```text
BEGIN
  statements
EXCEPTION
  WHEN exception_identifier
    statements to handle the exception
  WHEN another_exception_identifier
    statements to handle the exception
END
```

Map to target language try/catch, Result types, or error returns consistently per project convention.

### 4.4 Calling procedures

```text
CALL RoutineName WITH argumentList
CALL RoutineName WITH argumentList RETURNING resultName
```

Example:

```text
CALL AverageAge WITH StudentAges RETURNING meanAge
CALL Swap WITH CurrentItem AND TargetItem
CALL SquareRoot WITH orbitHeight RETURNING nominalOrbit
```

---

## 5. Alignment with Blueprint Phase 4 (BP-001)

This section satisfies the Blueprint Phase 4 deliverable `docs/blueprint/04-pseudocode-format-guidelines.md` when copied or mirrored into `docs/blueprint/`.

### 5.1 Mandatory skeleton

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

### 5.2 Examples to cover in project templates

- Functions and pure helpers  
- Conditionals and CASE  
- Loops (FOR, WHILE, REPEAT-UNTIL)  
- Async flows (async steps explicitly ordered; WAIT ON / AFTER callbacks as agreed)  
- Module headers (service vs UI component)

### 5.3 Naming conventions

Document team choices (camelCase, PascalCase, file prefixes) and **UI vs service** naming; align with Phase 7 Section 12 when UI applies.

### 5.4 File templates

Maintain templates under `docs/blueprint/templates/` for:

- Backend service  
- UI component (props/state/handlers/renderer abstract)  
- Data model / entity operations  

### 5.5 Traceability annotations (every pseudocode file)

- `SOURCE: <path/to/original.file>`  
- `DOMAIN: <domain name>` · `MODULE: <module id>`  
- Optional: requirement or feature IDs used by the trace matrix  

### 5.6 Error-handling notation

- TRY / EXCEPTION blocks or equivalent for recoverable failures  
- Named error categories (e.g. ValidationError, IntegrationError)  
- Comments for fallbacks and edge cases  

### 5.7 Logging and observability (optional in pseudocode)

- `LOG:` significant state transitions  
- `TRACE:` paths needed for debugging or audit  

---

## 6. Per-file separation

1. **One primary SOURCE per file** for straightforward mapping from codebase to blueprint.  
2. **Split** only when a source file mixes unrelated concerns that Phase 7 tiers already separated.  
3. **Name** pseudocode files so they mirror or clearly reference the implementation filename (`<name>.pseudo.md`).  
4. **Cross-file calls** appear as `CALL` lines with module boundaries consistent with architecture.  
5. **Frontend/UI:** For desktop or hybrid apps, structured pseudocode may list **props, state, handlers, and renderer responsibilities** in sections before control-flow detail (see Appendix A).  

---

## 7. Procedure — Pseudocode to code translation

When converting pseudocode to a target programming language (human or AI-assisted), follow this order:

1. **Analyze the target language** — syntax, type system, idiomatic control flow, module boundaries, and house style.  
2. **Translate control structures** — map IF/WHILE/FOR/CASE to language constructs; preserve nesting and order.  
3. **Declare data** — replace abstract variables with typed, scoped, initialized declarations.  
4. **Choose structures** — arrays, maps, queues, etc., matching intent and performance expectations.  
5. **Implement I/O** — stdin/stdout, files, network, UI bindings per platform.  
6. **Convert expressions** — math and string ops with correct precedence and library calls.  
7. **Define routines** — signatures, parameter passing, return types, contracts; add docstrings/comments per standard.  
8. **Add robust error handling** — validation, bounds, failures from dependencies; reflect EXCEPTION paths from pseudocode.  
9. **Optimize cautiously** — only where behavior and complexity class remain provably equivalent or an approved change exists.  
10. **Document deltas** — comments where code must diverge from pseudocode (language limits, security policy).  
11. **Plan tests** — unit slices per function; integration points for external systems; golden outputs where applicable.  
12. **Preserve algorithm integrity** — same inputs/outputs and complexity class unless explicitly waived.

---

## 8. Error handling during implementation

Pseudocode often omits defensive detail. During translation:

| Topic | Action |
| --- | --- |
| Preconditions | Assert or validate inputs described implicitly. |
| External systems | Timeouts, retries, and error propagation per integration standard. |
| Security | No secrets in logs; sanitize user-derived data at trust boundaries. |
| Fail-safe defaults | On ambiguity, choose the safer branch and record in review notes. |

---

## 9. Testing approach

| Stage | Focus |
| --- | --- |
| Per routine | Translate one FUNCTION at a time; immediate unit tests for that surface. |
| Control paths | Every IF/CASE branch and loop exit (including empty collection). |
| Integration | CALL boundaries between modules match architecture contracts. |
| Regression | Lock golden behavior with tests before refactors that “optimize.” |

Prefer incremental delivery: **implement → test → integrate** rather than bulk translation without tests.

For **AAA structure, mocking, determinism, edge cases, security-aware unit checks, test placement, and run-after-write workflow**, use **`Unit Test and Pseudocode Writing Guidelines.md`** (Phase 8–10), aligned with USSM Section 7 and Phase 10.

---

## 10. Inputs for a conversion session

For reproducible results (especially with assistants), provide:

- Complete pseudocode (or scoped excerpt with imports/calls listed).  
- Target language and minimum version.  
- Constraints (libraries forbidden/required, performance, style guide).  
- Expected behavior: sample inputs/outputs or acceptance criteria.  
- Links to `SOURCE` files when validating fidelity.

---

## 11. Quality checklist (before merge)

- [ ] Each pseudocode block maps to code without undocumented behavior changes.  
- [ ] All `SOURCE` paths and tags updated if files moved.  
- [ ] Error and edge paths from Sections 5.6 and 8 addressed in code and tests.  
- [ ] Trace matrix / backlog IDs updated if BP-001 or TD-001 apply.  

---

## 12. Related Documents

| Document | Role |
| --- | --- |
| `14. Phase 8 — Development Preparation.md` | Phase owner for pseudocode body preparation and G6 readiness evidence. |
| `15. Phase 9 — Implementation.md` | Phase owner for translating approved pseudocode into implementation. |
| `16. Phase 10 — Testing and Validation.md` | Validates implementation behavior and test coverage informed by pseudocode. |
| `21. Decision Gates.md` | G6 readiness evidence and downstream gate expectations. |
| `22. Required Documents.md` | Canonical procedure register. |
| `24. Traceability Rules.md` | Source, requirement, design, task, code, and test traceability expectations. |
| `25. Quality and Compliance Checks.md` | Phase 8/G6, Phase 9, and Phase 10 quality checks. |
| `Universal Blueprint Extraction — BP-001 Procedure.md` | Blueprint process that emits pseudocode format and pseudocode body artifacts. |
| `Unit Test and Pseudocode Writing Guidelines.md` | Test discipline aligned to pseudocode-derived implementation. |

---

## Appendix A — Structured pseudocode for IPC-style features (example outline)

When documenting **tasks, workflows, and notifications** across processes (e.g. Electron main/renderer), structured pseudocode may include:

1. **Project structure** — where entry points and IPC helpers live.  
2. **Step-by-step** narrative of startup and channel registration.  
3. **IPC channel design** — channel names, payloads, request/response vs fire-and-forget.  
4. **Main process** — registration, validation, delegation to domain logic.  
5. **Renderer** — invocation from UI, state updates, error surfacing.  
6. **Optional enhancements** — preload scope, contextBridge constraints.  
7. **Final directory layout** — agrees with module planning from Phase 8.

This appendix does not mandate a stack; it defines **what** to capture when pseudocode spans multiple runtime roles.

---

## Revision

Update this document when format rules or translation gates change; bump references in Phase 7–9 entry/exit criteria when filenames or locations change.
