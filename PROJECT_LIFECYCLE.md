# PROJECT LIFECYCLE & EXECUTION FRAMEWORK
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## Standard 9-Phase Engineering Lifecycle

When a project instruction is received from the user, the Central Orchestrator and specialized engineering agents automatically execute the following 9-phase lifecycle:

```
  PHASE 1: REQUIREMENTS ANALYSIS
             ↓
  PHASE 2: TECHNICAL PLANNING
             ↓
  PHASE 3: TASK DECOMPOSITION
             ↓
  PHASE 4: IMPLEMENTATION (PARALLEL WORKSTREAMS)
             ↓
  PHASE 5: INTEGRATION & CONTRACT BINDING
             ↓
  PHASE 6: COMPREHENSIVE TESTING & DEFECT FIXING
             ↓
  PHASE 7: SECURITY AUDIT & PERFORMANCE PROFILING
             ↓
  PHASE 8: FINAL QUALITY & ACCEPTANCE REVIEW
             ↓
  PHASE 9: DELIVERY & RUNBOOK PRESENTATION
```

---

### PHASE 1 — Requirements Analysis
- **Goal:** Comprehend the project domain, primary audience, operational flows, and critical requirements.
- **Activities:**
  - Map core business entities and workflows.
  - Distinguish essential MVP capabilities from secondary enhancements.
  - Formulate non-functional requirements (scalability, latency, data retention).
  - Ask targeted clarification questions ONLY when essential business logic is ambiguous; do not stall momentum with trivial queries.

### PHASE 2 — Technical Planning
- **Goal:** Select the optimal technology stack and design high-level architecture.
- **Activities:**
  - Select frontend framework, backend runtime, database engine, and UI library based on domain needs.
  - Design database schema relations and API structure.
  - Define authentication, authorization, and session model.
  - Formulate UI/UX design direction (neutral light theme, component library).
  - Produce initial architecture documentation.

### PHASE 3 — Task Decomposition
- **Goal:** Transform technical plans into granular, assignable work orders.
- **Activities:**
  - Break development into independent and dependent tasks.
  - Assign explicit module and file ownership to specialized subagents.
  - Define strict acceptance criteria and deliverables for every task.

### PHASE 4 — Implementation (Parallel Execution)
- **Goal:** Construct the application components in parallel.
- **Activities:**
  - Dispatch tasks concurrently (e.g., UI design + database schemas, frontend views + backend services).
  - Enforce engineering standards: strict typing, proper error handling, no mock code.
  - Exchange contracts (API schemas, database models) via A2A messaging.

### PHASE 5 — Integration & Contract Binding
- **Goal:** Wire all components into a cohesive, running application.
- **Activities:**
  - Connect client API fetchers to backend endpoints.
  - Connect backend services to database queries and transactions.
  - Verify environmental configurations and runtime compatibility.
  - Resolve integration mismatches immediately under Orchestrator oversight.

### PHASE 6 — Testing & Defect Remediation
- **Goal:** Validate system correctness and eliminate regressions.
- **Activities:**
  - Run automated unit, integration, and user-journey test suites.
  - Reproduce and fix all detected bugs using test-driven regression verification.
  - Verify loading, error, and boundary behaviors under adverse conditions.

### PHASE 7 — Security & Performance Review
- **Goal:** Harden the system and optimize throughput.
- **Activities:**
  - Audit against OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, auth flaws).
  - Check dependency vulnerabilities (`audit`).
  - Profile client bundle sizes, query execution plans, and response latencies.
  - Implement caching, indexing, or bundle optimizations where necessary.

### PHASE 8 — Final Quality Review
- **Goal:** Independent verification of project completeness.
- **Activities:**
  - Code Reviewer and Orchestrator perform holistic audit against initial requirements.
  - Verify zero critical or high-severity blockers remain.
  - Reject false declarations of completeness if any core workflow remains non-functional.

### PHASE 9 — Delivery & Documentation
- **Goal:** Present the finished software and operational documentation to the user.
- **Deliverables:**
  - Comprehensive project overview and architecture summary.
  - Feature inventory and technical stack specifications.
  - Automated test execution metrics and security audit summary.
  - Clear, local setup instructions and deployment commands.
