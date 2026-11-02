# DATABASE ARCHITECTURE & DATA INTEGRITY STANDARDS
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## 1. Core Data Principles & Safety Directives

Data integrity is the bedrock of any business application. Database schemas must be deliberately designed, version-controlled, and safeguarded against accidental corruption or data loss.

### Strict Safety Prohibitions:
- ❌ **NEVER Drop Production/Live Data:** Destructive commands (`DROP TABLE`, `DROP DATABASE`, `TRUNCATE`) are strictly forbidden on populated or production databases.
- ❌ **NEVER Delete Data to Resolve Bugs:** Fixing code bugs by manually deleting database records is prohibited.
- ❌ **NEVER Silently Mutate Schemas:** Modifying database structures without version-controlled migration files that communicate changes to the team is prohibited.

---

## 2. Schema Modeling & Design Standards

1. **Relational Normalization:**
   - Default to Third Normal Form (3NF) to eliminate anomalies and data duplication. Denormalize only when verified performance profiling justifies it.
2. **Key Structures & Constraints:**
   - **Primary Keys:** Every table must have a distinct primary key (e.g., auto-incrementing integer or UUIDv4/UUIDv7 depending on scale and distributed requirements).
   - **Foreign Keys:** Explicit foreign key relationships with appropriate cascading constraints (`ON DELETE RESTRICT` or `ON DELETE CASCADE` where logically sound).
   - **Data Integrity Constraints:** Apply `NOT NULL`, `UNIQUE`, and `CHECK` constraints at the database level, not solely in application code.
3. **Temporal Tracking:**
   - Every primary entity table must include audit timestamps:
     - `created_at` (Timestamp with timezone, default current timestamp).
     - `updated_at` (Timestamp with timezone, updated via trigger or ORM hook).
   - Use soft-deletion (`deleted_at` nullable timestamp) for compliance-critical or audited entities.

---

## 3. Migration Strategy & Version Control

1. **Deterministic Migrations:**
   - All schema changes must be authored as reversible migration scripts using standard migration tooling (e.g., **Prisma**, **Drizzle**, **Knex**, **Alembic**, **Flyway**).
2. **Forward and Backward Compatibility:**
   - Migrations must support rollback (`down` migration).
   - Follow expand-and-contract patterns for major column modifications:
     1. Add new column (nullable or default value).
     2. Dual-write application code.
     3. Backfill data.
     4. Shift reads to new column.
     5. Remove old column in a subsequent migration.

---

## 4. Query Optimization & Indexing Guidelines

1. **Indexing Strategy:**
   - Always create indexes on:
     - Foreign key columns used in joins.
     - Frequently queried filter columns (`WHERE user_id = ... AND status = ...`).
     - Sorting columns (`ORDER BY created_at DESC`).
   - Avoid over-indexing write-heavy tables; verify index utility using `EXPLAIN ANALYZE`.
2. **Mitigation of N+1 Query Anti-Pattern:**
   - Never execute queries inside loops.
   - Use eager loading (`include`, `join`, `select_related`) or dataloaders to batch database queries.
3. **Connection Pooling:**
   - Maintain appropriate database connection pools to prevent connection exhaustion under concurrent traffic.

---

## 5. Transactions & Concurrency Control

1. **ACID Transactions:**
   - Wrap multi-table state modifications (e.g., order creation + inventory reduction + ledger entry) inside explicit database transactions.
2. **Concurrency Handling:**
   - Use optimistic locking (e.g., version column) or explicit row-level locks (`SELECT ... FOR UPDATE`) to prevent race conditions during concurrent updates.

---

## 6. Seed Data & Local Development

1. **Deterministic Seeders:**
   - Provide clean database seed scripts (`seed.ts` / `seed.py`) to generate realistic initial data for local development and integration tests.
2. **Sanitized Fixtures:**
   - Never use real customer PII in development seeds or test environments.
