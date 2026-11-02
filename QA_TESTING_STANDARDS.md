# QA & TESTING STANDARDS
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## 1. Testing Philosophy & Pyramid

Quality assurance is an ongoing verification discipline, not an afterthought. We build deterministic, automated test suites that safeguard system correctness and prevent regressions.

```
       / \
      / E2E \       End-to-End Tests (Critical User Journeys)
     /-------\
    /  Integ  \     Integration Tests (API Endpoints, DB, Services)
   /-----------\
  /    Unit     \   Unit Tests (Domain Logic, Functions, Components)
 /---------------\
```

---

## 2. Test Layer Specifications

### Layer 1: Unit Testing (Foundation)
- **Scope:** Pure business logic, calculation engines, data transformation pipelines, utility helpers, and individual UI components.
- **Requirements:**
  - 100% deterministic execution; zero reliance on live network connections or remote services.
  - Fast execution (sub-second per suite).
  - Test edge cases: `null`, `undefined`, empty arrays, out-of-bound numbers, malformed strings.
- **Recommended Tools:** **Vitest**, **Jest**, **Pytest**, **Go test**.

### Layer 2: Integration Testing (Middleware & Data)
- **Scope:** API routes, controller-service interactions, ORM database queries, middleware pipelines, and third-party adapter interfaces.
- **Requirements:**
  - Execute against an isolated local database instance or lightweight container.
  - Test transactional rollback to ensure test isolation between test cases.
  - Verify HTTP response status codes, header configurations, and response schema contracts.
- **Recommended Tools:** **Supertest**, **Pytest with TestClient (FastAPI/Django)**, **Testcontainers**.

### Layer 3: End-to-End Testing (E2E)
- **Scope:** Complete end-user scenarios from initial landing to final transaction (e.g., registration → login → product search → checkout → invoice generation).
- **Requirements:**
  - Test real browser rendering, form interactions, navigation, and visual transitions.
  - Verify critical failure states and recovery paths.
- **Recommended Tools:** **Playwright**, **Cypress**.

---

## 3. Bug Reproduction & Verification Workflow

When a defect or bug is identified, the QA Engineer and assigned developer must strictly follow this protocol:

1. **Reproduction Test Case:**
   - Write a minimal, failing automated test case that explicitly reproduces the bug (`RED`).
2. **Root Cause Analysis:**
   - Diagnose why the failure occurs without making premature assumptions.
3. **Targeted Remediation:**
   - Implement the fix in the source code.
4. **Verification & Regression Check:**
   - Run the reproduction test to verify it now passes (`GREEN`).
   - Run the entire test suite to ensure zero regressions were introduced in unrelated modules.
5. **Documentation:**
   - Document the bug, root cause, and remediation in the QA verification log.

---

## 4. Test Quality & Determinism Rules

- ❌ **NO Flaky Tests:** Tests that intermittently pass or fail due to race conditions, timers, or animation lags are strictly prohibited. Always await concrete promises, state changes, or DOM locators.
- ❌ **NO Unchecked Assertions:** Every test must assert specific, meaningful outcomes. A test that simply invokes a function without checking its return value or state side effect is invalid.
- ❌ **NO External Network Dependencies:** All external network calls (e.g., Stripe, Twilio, external weather APIs) must be mocked with realistic payload fixtures during unit and integration runs.

---

## 5. Release Quality Gates

Before declaring a feature or project ready for delivery, the following gates must be verified:
1. All unit and integration test suites pass with 0 errors.
2. Core business workflows have verified E2E coverage.
3. Critical edge cases and boundary conditions are explicitly tested.
4. No unresolved regressions or high-severity defects remain.
