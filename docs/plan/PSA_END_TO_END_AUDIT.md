# PSA end-to-end audit

Audit date: 2026-10-19  
Scope: source tree and local Supabase migrations. The project credentials were not used to inspect or mutate the live Supabase project, so remote migration state and live records remain unverified.

## Status by product flow

| Flow | Status | Evidence and gap |
|---|---|---|
| Admin authentication | Partial | Supabase password login and server-side role checks exist. Login error UI had hidden Supabase error categories; local UI now maps common categories. Live Auth users and allow-list metadata were not inspected. |
| Partner intake | Partial | Public/offline intake, private document bucket, review endpoints and account linking exist. Review decisions now compare the stored status before update and prevent approval of rejected/withdrawn applications. Live migration state is unknown. The temporary password is derived from public organization name/date and should be replaced with an invite/reset link. |
| Partner workspace data | Partial | Auth profile and organization are loaded from Supabase. Partner programs/applications load through partner-only APIs, profile changes use an organization-scoped route, and documents/reports use private Storage plus signed URLs. Proposal editing and a shared program-detail page remain incomplete. |
| Program submission | Partial | Proposal modal posts drafts, submissions and edits/resubmissions to partner-scoped server endpoints. Endpoint validates category, date ordering, quota, text limits and image ownership. Partners can upload JPEG/PNG/WebP cover images (max 5 MB) into a separate public media bucket through a session- and organization-validated server route. Editing proposals after submission/review remains unavailable. |
| Program review/publication | Partial | Approval and publication are distinct. Admin publication is blocked before approval or when required public fields/deadline are invalid. Admin review notes are collected for revision/rejection, with compare-and-set status checks to prevent concurrent decisions overwriting one another. Editing after a proposal has been submitted/reviewed remains unavailable. |
| Public program listing | Partial | Public directory reads approved published/closed programs from a safe view, includes execution status and explicitly public timeline messages, and hides private participant data. Closed programs remain visible with registration disabled, and an unlimited quota is labeled clearly. `/program` provides a direct catalog and `/program/[id]` a shareable detail page. Live database view/migration availability is unverified. |
| Public program application | Partial | A no-account application form and endpoint now attach to a specific published program. A transactional RPC locks the program for deadline/quota/duplicate checks and records an audit event. Success feedback also reports Gmail outcome when opened from the volunteer portal and returns the applicant to the public catalog. The migration is local and must be applied remotely. |
| Admin application review | Partial | Admin API reviews `volunteer_applications`, now populated by public applications. UI supports program/status/search filters, grouped queues, detail answers/history/partner recommendation, paginated results and CSV export of the active group. Decision buttons follow allowed transitions and remain open on API failure. API compares the current row status during update to reject stale concurrent decisions. Final accepted/waitlisted/rejected decisions trigger a Gmail attempt and log its outcome; identical decisions do not resend. Failed attempts can be manually retried through admin follow-up. Email and decision cannot be one transaction across Supabase and Gmail. |
| Partner participant review | Partial | A partner-only endpoint now verifies application ownership through the program relation and stores a recommendation separately from the final application status. The database migration and partner UI depend on its remote application. |
| Email follow-up | Partial | Admin-triggered Gmail API and logs exist. Delivery depends on server-side Gmail OAuth variables. This does not yet cover all program application events or retries. |
| Program execution and reports | Partial | Local migration adds planned/open/closed/selection/announcement/preparation/ongoing/completion stages, public announcements/timeline and private reports. Partner endpoints update stages and submit reports; admin endpoints review reports and atomically confirm completion/cancellation. Public applications stop after registration closes or the program is complete/canceled. A shareable detail page reads the safe public view for public, admin, and partner users; admin/partner actions still lead to their management lists, so a shared editable/review detail remains outstanding. Remote migrations have not been applied. |
| Analytics | Partial | Admin and partner summaries use database-backed workspace values; some older unused dashboard components still contain hard-coded sample content and should not be reconnected without replacing it. |
| RLS and storage | Partial | Initial migration creates permissive demo policies; later migrations drop them and install scoped policies/private partner-document and program-report buckets. Server partner APIs bind sessions to the exact organization and the database status RPC verifies ownership. Upload APIs now check file signatures in addition to MIME/size. Cloud protections still depend on migrations being applied. |
| Audit trail | Partial | Several APIs write audit events, but writes are sometimes unchecked and there is no common transactional audit mechanism. |

## Priority order

1. Keep program approval separate from publication and validate publication server-side.
2. Replace mock partner and public program data paths with database-backed endpoints.
3. Add a single anonymous application flow attached to a valid published program; retain private applicant data and route it to shared admin/partner review permissions.
4. Add partner-only review recommendations and ensure final decisions are authorized consistently.
5. Add program execution status, announcements and report/document review.
6. Finish email event coverage, failure/retry visibility, analytics and end-to-end access tests.
7. Confirm cloud migration state and run role boundary checks against the actual Supabase project before release.

## Changes made during plan execution

- Removed `localStorage` and bundled demo arrays as AppContext data sources; public catalog, admin workspace and partner workspace load through server APIs.
- Added a public safe directory endpoint, partner workspace loading, actual partner proposal submission, partner-only review recommendation endpoint, organization profile update and private document upload/delete with signed URLs.
- Added the anonymous per-program application form, transactional database function, quota/deadline/duplicate checks, audit logging and Gmail confirmation attempt log.
- Added admin-triggered selection result emails for public program applicants, with sent/failed logs, and suppress duplicate sends when an unchanged final status is submitted again.
- Added 20-row pagination for filtered admin application queues, export aligned to the active queue, partner recommendation and answer/history details, and transition-aware decision controls that stay open when saving fails.
- Made partner profile resubmission status changes, linked application status and audit record atomic in a service-only database function.
- Added the local `20261019000001_program_execution_reports.sql` migration for program execution stages, public status history, private report storage and report metadata; connected partner upload/status controls, admin review/closure controls, and public announcements/timeline.
- Added partner-owned program cover uploads with MIME/signature/size checks and a separate public media bucket; private partner documents and reports remain in their own buckets.
- Added server-side signature checks for uploaded partner documents and program reports to reject files that only spoof an allowed MIME type.
- Added shareable `/program/[id]` detail pages backed by the safe published-program view and public-only timeline; the public directory links program titles to the detail page.
- Replaced static landing-page impact counts with live published-program/approved-partner counts, removed unsupported audience claims, and replaced the admin demo calendar with upcoming published-program dates.
- Landing-page volunteer/partner CTA buttons now open the separate public forms. Volunteer portal stays disabled unless explicitly enabled with `NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED=true`; partner access remains unaffected.
- The existing initial seed migration contains fixed example accounts/records. No seed data was added during this work; migration guidance says to skip that file for existing/production data.
- Separated proposal approval from publication and added server-side publication preconditions.
- Replaced hard-coded partner dashboard numbers/tasks with values derived from its Supabase workspace.

## Verification performed

- Read the Next.js App Router, route-handler and project-structure guides from the installed Next.js package before route/component changes.
- `npm.cmd run lint` passed after these changes.
- `npm.cmd run build` passed; Next.js lists the public application, partner execution/report and admin report routes.
- `npm.cmd test` passes the Node unit checks for MIME/signature validation (valid PDF/JPEG/PNG/WebP signatures and spoofed content rejection); this is not an end-to-end workflow test.
- `git diff --check` passed; the SQL migrations were reviewed locally but not run against PostgreSQL/Supabase.
- No end-to-end test suite or Supabase local instance is configured in package scripts.
- Isolated local migration validation was attempted without seed data, but PostgreSQL `initdb` could not create its restricted Windows token (error 87/3); the temporary directory was removed. The SQL migrations therefore remain unexecuted locally.
- Remote database state was not queried or changed.
