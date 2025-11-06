# **App Name**: Advisory Insights Platform

## Core Features:

- Session Creation and Randomization: Create secure participant sessions with server-side condition assignment using a seeded RNG. An anonymous JWT token authenticates write operations, ensuring client-side condition control is prevented. Seed is written to experimentMeta and each participant record; expose an export of seed→assignment mapping for OSF.
- Multi-Page Participant Flow: Implement a React SPA with pages for consent, pre-screen, dossier, advisory (conditioned), comprehension checks, objective choice, subjective DQ, mediators, controls, open rationale, and debrief.
- Data Capture and Instrumentation: Capture behavioral and self-report data, log timing/scroll metadata (dossier_view_time, advisory_view_time, advisory_scroll_count), focus/visibility events, and page timestamps. Data will be posted incrementally to Firestore.
- Data Encryption: Encrypt free text responses (advisory_text, choice_reason) using Cloud KMS envelope encryption to protect PII. Document KMS key rotation, wrapped data key storage, and researcher access control.
- Derived Composite Computation: Compute derived composites (DQ_SUB_MEAN, credibility subscales, psychological distance, perceived LA, risk composite, financial literacy score) server-side, adhering to a ≥75% completeness rule. Persist derived computation metadata (timestamp, items used, completeness %) for traceability.
- Objective Linguistic Analysis Tool: Implement an objective linguistic analysis tool which analyzes raw text using spaCy (or managed NLP service), computes lexical category rates and LA_OBJECTIVE, and persists the computed metrics and LA objective. Enqueue LA pipeline jobs and move spaCy worker to Cloud Run; create manualCodingQueue and admin double-coding UI.
- Data Quality Flagging: Compute data quality flags (flag_comprehension, flag_viewtime, flag_straightline) server-side based on pre-defined criteria to enable sensitivity analyses. These will serve as a tool during statistical analysis.
- Security Rules Enforcement: Add Firestore security rules enforcing participant token claims and admin roles, read/write rate limits. Implement short JWT lifetime, plan refresh or session-extend flow, and provide a revocation list.
- Consent Recording and IRB Fields: Store consent timestamp and consent form version; ensure consent text is archived and versioned in Firestore.
- Data Retention and Deletion Policy: Implement lifecycle rules/Cloud Function to purge or archive PII per IRB (e.g., retention = X years) and log deletions.
- Export and OSF Packaging Workflow: Server export must enforce redaction rules (remove raw free text or provide encrypted blob only) and attach experimentMeta including seed, stimuliVersion, and lexiconVersion. Implement export CF with de-identification, versioned metadata, and signed URL generation.
- Admin Audit Log and Access Control: Add audit/{id} writes on every admin action (who, when, why) and role-based UI gating.
- Measurement and Validation: Store item-level data in a structure that allows CFA re-estimation; keep measurement-model versioning in metadata. Persist derived computation metadata (timestamp, items used, completeness %) so reviewers can trace composite construction. Save common method bias and CFA artifacts with data
- Manual Coding Workflow and Kappa Pipeline: Implement manualCodingQueue, admin UI for double coding, and a metric uploader that stores Cohen’s κ and can pause LA pipeline if κ < .70.
- Staging, Pilot Sandbox, and SimulatePilot Isolation: Separate staging project and sandbox collections for pilot runs so real dataset remains pristine. Add staging sandbox and run the 50-participant Cypress pilot there.
- End-to-End Tests and CI/CD: Wire the Cypress suite to CI with parallelization and a gating rule that blocks production deploys if tests fail.
- Rate Limiting, Retry/Backoff, and Graceful Degradation: Client/backoff code and Cloud Function idempotency to handle retries and intermittent failures.
- LA Pipeline Hosting Plan: spaCy heavy NLP belongs on Cloud Run with autoscaling or a dedicated worker pool (Cloud Tasks) — do not run heavy NLP synchronously in a short-lived function. Queueing for compute-intensive jobs & monitoring thresholds. Use Cloud Tasks with dead-letter queue and alerts when backlog grows.
- PII Minimization and Data Minimization Checklist: Ensure no emails/identifiers saved; if added, encrypt and document reason.
- IP/Geo Logging Policy and Access Restrictions: Define whether IPs are logged and how long; add this to consent and IRB docs.
- Penetration Testing / Vulnerability Scanning Plan: Plan a basic security scan before main run.
- Accessibility Conformance: Include ARIA attributes, keyboard labels, and contrast checks; run automated a11y tests (axe).
- Mobile UX Checks: Test on common devices and verify Inter license and webfont caching.
- Researcher Admin Onboarding & SOPs: Short SOP docs (1–2 pages) describing steps to generate export, who can decrypt, and how to revoke access. Draft SOPs for key management, decryption, export, and IRB compliance; store these in repo/OSF materials.
- Incident Response and Participant Contact Workflow: Template email and procedure if participant complaint or data breach occurs.
- Stimuli Rendering Fidelity: Embed font/line metrics in stimuli metadata so archived renderings can be audited.
- Admin UI Session Replay: Admin UI: include “replay session” that shows time/scroll timeline for a participant for quick QA.
- Legal / regulatory compliance (GDPR, China/Local law): Firestore + KMS across jurisdictions requires explicit compliance. Document data transfer / storage jurisdiction, lawful basis for processing, and retention/erasure procedures in IRB and legal notes.
- Secrets, keys and KMS governance (operationalize): Key rotation and storage were mentioned, but not the operational runbook. Write a Key Management SOP: who can generate data keys, how to rotate, KMS IAM roles, and emergency key‑revocation steps. Store SOP in repo and link in admin UI.
- Firestore security rules + least privilege IAM (explicit): Rules must be auditable and tested. Add versioned rules in repo, unit tests for rules (firebase emulators), and restrict researcher roles with least privilege (separate read/export rights).
- Token lifecycle and session recovery UX: Short tokens can expire mid‑survey. Implement refresh flow or silent re‑auth (secure cookie) and clear UX for participants if session expires; log expiry events.
- Backup & recovery (DB, storage, keys): Data loss would be catastrophic. Scheduled encrypted backups, test recovery plan (restore test monthly), and backup retention policy.
- Versioned experiment registry artifact (immutable): Reviewers require an auditable pre‑registration → stimulus → code mapping. Publish experimentMeta as immutable JSON (seed, stimuliVersion, lexiconVersion, code SHA) in Cloud Storage and mirror to OSF.
- Data dictionary and canonical codebook artifact (machine‑readable): Ensures exports are analysis‑ready and reduces misunderstandings. Produce JSON/CSV codebook with variable names, labels, scoring, missingness rules; include in export.
- Instrumented monitoring & alerting (SLOs): Detect pipeline or LA queue failures early. Set Cloud Monitoring alerts for LA job queue length, Cloud Function errors, export failures, and KMS errors.
- Cost estimate and quota plan for pilot → scale: NLP tasks, Cloud Run autoscaling and exports incur costs. Produce a conservative monthly cost estimate and guardrails (max concurrent LA jobs), include budget alerts.
- Data provenance & reproducible export manifest: Traceability from raw to composite is required for reviewers. Each exported row must reference participant_id, response doc ids, derived computation metadata (items used, timestamp, code sha).
- Participant compensation tracking and fraud detection: Panel platforms require reconciliation; fraud affects data quality. Include a payment reconciliation table and simple fraud heuristics (duplicate userAgent, implausible times).
- Automated security testing in CI (SCA + SAST): Dependency and code vulnerabilities must be surfaced pre‑deploy. Add Dependabot/Snyk or GitHub Actions SCA and run static analysis in CI.
- Consent localization and readability checks: Provide consent at appropriate reading grade, translate into target languages, and log consent language version.
- Accessibility testing (manual + automated): Run axe CLI in CI and enforce no critical violations; document aria attributes.
- Stimulus rendering QA (pixel test): Snapshot archival rendering in staging to ensure fonts/spacing match archived metadata.
- Sample size and randomization audit log (statistical): Log incremental cell counts; warn if imbalance exceeds threshold; store power analysis snapshot.
- Mock data generator and sandbox exporter templates: Make simulatePilot export a sanitized dataset for downstream analysis practice.
- Researcher training & role separation (ops): Short workshop or checklist for researchers to follow export/decrypt SOPs.
- Third‑party license and provenance file: Track license for each package and stimulus asset (images, fonts); include in OSF materials.

## Style Guidelines:

- Primary color: Dark Blue (#30475E), chosen to reflect the serious, scientific, and academic aspects of research.
- Background color: Light Gray (#F0F0F0), providing a neutral, clean backdrop to improve legibility and minimize distraction.
- Accent color: Warm Orange (#F05454), drawing attention to key interactive elements and important information.
- Body and headline font: 'Inter', a sans-serif font providing a modern and neutral look suitable for on-screen readability.
- Use clear and concise icons to represent different stages of the experiment, data quality flags, and admin functions.
- Implement a multi-page layout with clear sectioning and progress indicators, enforcing a strict experiment sequence.
- Use subtle transitions and loading animations to provide feedback and maintain participant engagement without being distracting.