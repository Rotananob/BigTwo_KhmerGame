# PRODUCTION ENGINEERING STANDARDS
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## 1. Production-First Mandate

All software developed in this organization must adhere to strict production-grade engineering principles. Proof-of-concept shortcuts and visual illusions of functionality are prohibited.

### Strict Prohibitions:
- **NO Mock Data in Production Code:** Real data persistence and real API queries are mandatory. Mock data is permitted ONLY inside automated test suites (`*.spec.ts`, `tests/`).
- **NO Fake API Responses:** All backend endpoints must connect to actual business logic and database queries.
- **NO Dummy UI Elements:** Every button, input, toggle, and dropdown must perform a concrete, implemented function or provide clear contextual feedback.
- **NO LocalStorage as Backend Substitute:** Client-side storage must only hold client preferences or tokens; never use it as a makeshift database for core entities.
- **NO Simulated Transactions:** Never present simulated checkouts or fake confirmations without real processing or sandbox integration.
- **NO Hardcoded Credentials:** Passwords, API tokens, secret keys, and database connection strings must NEVER be hardcoded.

---

## 2. Code Architecture & Design Principles

1. **Separation of Concerns:**
   - **Presentation Layer:** Views, UI components, layout structures, user event capturing.
   - **Application / State Layer:** State management, data fetching hooks, client-side business orchestration.
   - **Domain / Business Layer:** Pure business entities, domain services, business validation rules.
   - **Infrastructure / Data Layer:** Database access (ORMs/query builders), external HTTP clients, cache drivers.
2. **SOLID Principles:**
   - Single Responsibility: Each class, function, or module must have one reason to change.
   - Open/Closed: Software entities should be open for extension, closed for modification.
   - Liskov Substitution: Subtypes must be substitutable for their base types.
   - Interface Segregation: Keep interfaces focused and granular.
   - Dependency Inversion: Depend upon abstractions, not concretions.
3. **DRY (Don't Repeat Yourself):** Extract common patterns into well-typed utility functions or reusable components, while balancing readability over excessive abstraction.

---

## 3. Strict Type Safety

- **TypeScript:** Strict mode enabled (`"strict": true` in `tsconfig.json`). Explicit interfaces/types for all API payloads, component props, and database models. Disallow `any`; use `unknown` with type guards where flexibility is necessary.
- **Python:** Use type hints throughout (`from typing import Optional, List, Dict`). Validate schemas with `pydantic` or `dataclasses`.
- **Go / Rust / Other:** Enforce static typing and idiomatic error handling.

---

## 4. Error Handling & Resilience

1. **Explicit Error Handling:** Never swallow exceptions or leave catch blocks empty (`try { ... } catch (e) {}` is prohibited).
2. **User-Facing vs System Errors:**
   - Return clean, safe, and actionable error messages to the client.
   - Do NOT leak stack traces, database schema details, or system internals to end users.
   - Log full diagnostic errors, including timestamps, request IDs, and stack traces on the server.
3. **Graceful Degradation & Fallbacks:** UI components must render explicit fallback UI (error boundaries, retry buttons) when network requests or services fail.

---

## 5. Configuration & Environment Management

1. **Single Source of Truth:** All environmental configurations must be read from environment variables.
2. **Environment Template:** A comprehensive `.env.example` file must be maintained with all required keys, defaults, and usage comments.
3. **Startup Validation:** The application backend must validate the presence and validity of critical environment variables at startup and fail fast if missing.

---

## 6. Git Version Control & Change Hygiene

1. **Atomic Commits:** Each commit must represent a single logical change.
2. **Conventional Commit Syntax:**
   - `feat(scope): add new feature`
   - `fix(scope): resolve bug`
   - `refactor(scope): restructure existing code without behavioral changes`
   - `test(scope): add or modify tests`
   - `docs(scope): update documentation`
   - `chore(scope): build tools, dependencies, or workspace config`
3. **Pre-Change Verification:** Before making sweeping changes, inspect existing code, verify tests, and create a git commit checkpoint.
4. **Never Force Destructive Git Operations:** Rebase or force-pushing that alters shared history is forbidden without explicit authorization.
