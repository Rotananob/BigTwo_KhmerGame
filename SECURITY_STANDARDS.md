# CYBERSECURITY & DEFENSIVE ENGINEERING STANDARDS
**Google Antigravity 2.0 Autonomous Engineering Organization**

---

## 1. Core Security Principles

Security is non-negotiable throughout the development lifecycle. We practice defense-in-depth, zero-trust internal boundaries, and least-privilege access across all modules.

### Uncompromising Prohibitions:
- ❌ **NEVER Commit Secrets:** API keys, passwords, database credentials, and signing keys must never be committed to Git. Enforce `.gitignore` from project inception.
- ❌ **NEVER Store Passwords in Plaintext:** Always hash passwords with modern, battle-tested algorithms.
- ❌ **NEVER Bypass Auth for Testing:** Never disable authentication or security checks in production or staging builds for convenience.
- ❌ **NEVER Execute Unauthorized External Tests:** Pentesting and vulnerability scans are restricted strictly to the local workspace environment.

---

## 2. Authentication & Credential Management

1. **Password Hashing:**
   - Use **Argon2id** (preferred) or **bcrypt** (minimum 12 salt rounds).
   - Enforce strong password complexity rules (minimum length: 12 characters, mix of character classes).
2. **Session & Token Management:**
   - Store session identifiers or JWTs in `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax`) cookies.
   - Do NOT store authentication tokens in `localStorage` or `sessionStorage` due to XSS vulnerability.
   - Implement token expiration, rotation, and revocation mechanisms.
3. **Multi-Factor Authentication (MFA):**
   - Provide standard TOTP-based (Time-based One-Time Password) MFA integration where authentication is required for critical systems.

---

## 3. Authorization & Access Control

1. **Role-Based / Attribute-Based Access Control (RBAC/ABAC):**
   - Enforce authorization checks at the backend controller and service layers; never rely solely on frontend route guards or hidden UI elements.
2. **Insecure Direct Object Reference (IDOR) Mitigation:**
   - Always verify that the authenticated user owns or has explicit permission to access the requested resource ID before performing read, update, or delete operations.
3. **Principle of Least Privilege:**
   - Database service users must only possess permissions required for operational tasks (e.g., no `SUPERUSER` or `DROP DATABASE` grants for standard app connections).

---

## 4. Input Validation & Data Sanitization

1. **Boundary Schema Validation:**
   - Validate every incoming request body, query parameter, header, and path parameter using schema validation libraries (e.g., **Zod**, **Pydantic**, **Joi**, **Yup**).
   - Reject unvalidated requests immediately with HTTP 400 Bad Request.
2. **SQL Injection Mitigation:**
   - Always use parameterized queries, prepared statements, or hardened ORMs (e.g., Prisma, Drizzle, SQLAlchemy, TypeORM).
   - Never concatenate raw user input into dynamic SQL strings.
3. **Cross-Site Scripting (XSS) Prevention:**
   - Rely on modern framework automatic escaping (React JSX, Vue templates, Svelte).
   - If HTML rendering is strictly required, sanitize input using hardened sanitizers like `DOMPurify` or `sanitize-html`.
4. **Cross-Site Request Forgery (CSRF):**
   - Implement CSRF protection tokens or utilize `SameSite=Lax/Strict` cookie policies for state-modifying requests (POST, PUT, DELETE, PATCH).

---

## 5. Network & API Security

1. **CORS (Cross-Origin Resource Sharing):**
   - Explicitly define allowed origins. Never use `Access-Control-Allow-Origin: *` in combination with credentials.
2. **Rate Limiting & Abuse Prevention:**
   - Implement rate limiting on sensitive routes (authentication, password reset, payment endpoints, public APIs) using sliding window or token bucket algorithms.
3. **Security Headers:**
   - Ensure the server transmits standard defense headers:
     - `Content-Security-Policy (CSP)`
     - `Strict-Transport-Security (HSTS)`
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY` (or `SAMEORIGIN`)
     - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 6. Dependency & Vulnerability Auditing

1. **Automated Audits:**
   - Run dependency audit tools (`npm audit`, `pip-audit`, `cargo audit`) during QA and before releases.
   - Immediately remediate critical and high severity vulnerabilities.
2. **Sanitized Logging:**
   - Never log sensitive fields (passwords, payment cards, session tokens, personal identifiable information).
   - Sanitize log streams with redaction masks.
