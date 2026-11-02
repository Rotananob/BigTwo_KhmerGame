# AGENT COORDINATION & PARALLEL EXECUTION PROTOCOL
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## 1. Orchestration Architecture

The Central Orchestrator (CTO / Tech Lead) manages all subagents, assigns task ownership, mediates communication, and conducts final reviews.

```
+-------------------------------------------------------------+
|               Central Orchestrator (CTO)                    |
+-------------------------------------------------------------+
         |                              |              |
         v                              v              v
+------------------+          +------------------+    ...
| Subagent: FE     | <======> | Subagent: BE     |
| (Frontend Dev)   |   A2A    | (Backend Dev)    |
+------------------+          +------------------+
```

---

## 2. Supported Parallel Execution Patterns

Antigravity 2.0 natively supports asynchronous background execution of multiple subagents and background tasks. The Orchestrator leverages parallel execution for non-conflicting, independent streams of work:

| Parallel Workstream A | Parallel Workstream B | Synchronization Point |
| :--- | :--- | :--- |
| **UI/UX Design Tokens & Layout** | **Database Schema & Migrations** | Software Architect reviews alignment |
| **Frontend Component Templates** | **Backend API Business Logic** | Frozen API Contract (OpenAPI/Zod) |
| **Unit Test Authoring (QA)** | **Feature Implementation** | Pre-merge Test Execution Gate |
| **Security Audit (Pentest)** | **Code Quality Review (CR)** | Joint Audit Report to Orchestrator |

---

## 3. Standard Task Assignment Template

Every task dispatched by the Orchestrator or communicated between agents must conform to the following schema:

```markdown
### TASK: [TASK_ID] - [Task Title]
- **Responsible Agent:** [e.g., frontend-engineer, backend-engineer]
- **Status:** [QUEUED | IN_PROGRESS | BLOCKED | READY_FOR_REVIEW | DONE]
- **Priority:** [CRITICAL | HIGH | MEDIUM | LOW]
- **Dependencies:** [List of Task IDs that must be completed first]
- **Target Files / Module Scope:**
  - `src/modules/auth/auth.service.ts`
  - `src/modules/auth/auth.controller.ts`
- **Description:** [Concise, actionable task description]
- **Expected Output:** [Specific files, functions, or artifacts to produce]
- **Acceptance Criteria:**
  1. [Criterion 1]
  2. [Criterion 2]
- **Blockers / Notes:** [None or description of blocker]
```

---

## 4. Agent-to-Agent (A2A) Communication Protocol

### Supported Mechanisms in Antigravity 2.0:
1. **Subagent Invocation (`invoke_subagent`):** Launches specialized agents with distinct system prompts and tool access.
2. **Direct Messaging (`send_message`):** Sends messages directly to active subagents using their unique conversation IDs.
3. **Reactive Wakeup:** The environment automatically notifies the recipient or Orchestrator when a task, subagent, or message completes. **Polling in loops is strictly forbidden.**

### Information Exchanged via A2A:
- **Contract Freezes:** API endpoints, parameter schemas, and response types.
- **Schema Updates:** Database migrations, foreign keys, and model definitions.
- **Blockers:** Missing dependencies, broken contracts, or environment issues.
- **Audit Findings:** Security flags, failed test cases, and performance regressions.

---

## 5. File Ownership & Collision Prevention Rules

1. **Strict File Ownership:** No two agents may edit the same file simultaneously.
   - Example: Frontend Engineer owns `src/client/**`; Backend Engineer owns `src/server/**`; Database Engineer owns `prisma/**` or `migrations/**`.
2. **Contract-First Integration:** Frontend and Backend integration work cannot begin until the API Contract is explicitly approved by the Orchestrator.
3. **Immediate Escalation:** If an agent encounters a blocker or requires modifications to a file outside its ownership scope, it must report the issue to the Orchestrator immediately rather than modifying unauthorized files.
4. **Integration Gate:** The Orchestrator verifies that all components cleanly build, pass unit and integration tests, and operate cohesively before marking any milestone complete.
