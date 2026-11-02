# CONTINUOUS IMPROVEMENT & QUALITY REFINEMENT LOOP
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## 1. The Engineering Quality Loop

To maintain production excellence without succumbing to stagnation or endless churn, the organization adheres to a rigorous closed-loop engineering cycle:

```
    +-------------------------------------------------------+
    |                                                       |
    v                                                       |
 [ANALYZE] -> [PLAN] -> [DELEGATE] -> [IMPLEMENT]           |
    |                                     |                 |
    +-------------------------------------+                 |
                      |                                     |
                      v                                     |
                [INTEGRATE] -> [TEST] -> [REVIEW]           |
                      |            |        |               |
                      +------------+--------+               |
                                   |                        |
                                   v                        |
                             [FIX & OPTIMIZE]               |
                                   |                        |
                                   v                        |
                              [REASSESS] -------------------+
```

---

## 2. Priority Hierarchy

When balancing engineering trade-offs, all agents and the Orchestrator adhere to this strict prioritization order:

1. **Correctness:** Does the code solve the user's business requirement accurately and without bugs?
2. **Security:** Is user data protected? Are all attack vectors and vulnerabilities mitigated?
3. **Reliability:** Does the system handle network drops, unexpected inputs, and crashes gracefully?
4. **Maintainability:** Is the code clean, modular, typed, and understandable to other engineers?
5. **Performance:** Does the application load fast, run smoothly, and conserve host resources?
6. **Accessibility (a11y):** Can the interface be navigated with assistive technologies and keyboards?
7. **User Experience (UX):** Is the interface pleasant, responsive, clear, and intuitive?

---

## 3. Pre-Completion Quality Verification Checklist

A feature or sub-system is NEVER declared complete upon initial code compilation. The following checks must pass:

- [ ] **Functional Verification:** Does the feature satisfy 100% of the defined acceptance criteria?
- [ ] **Automated Testing:** Have relevant unit and integration test suites been executed and passed?
- [ ] **Contract Integration:** Are all API and database interactions verified with live contracts?
- [ ] **Error Handling:** Are loading, error, and empty states rendered properly?
- [ ] **Security Review:** Has the code been checked for injection, auth leaks, and unvalidated inputs?
- [ ] **Responsive UI:** Is the layout tested on mobile, tablet, and desktop viewports?
- [ ] **Performance Profile:** Are bundle sizes and database queries within acceptable limits?
- [ ] **Peer Review:** Has the Code Reviewer agent inspected and approved the changes?

---

## 4. Guardrails Against Infinite Churn

Continuous improvement does NOT mean continuous rewriting. We observe strict guardrails:
- **No Refactoring Without Justification:** Stable, tested code must NOT be rewritten merely for stylistic preference or cosmetic reorganization.
- **Measurable Acceptance Criteria:** Every optimization or refactoring task must have a measurable goal (e.g., "reduce bundle size by 20%", "eliminate N+1 query on `/api/products`", "resolve CVE-XXXX").
- **Stability First:** If an implementation is correct, secure, and performant, preserve it and proceed to the next milestone.
