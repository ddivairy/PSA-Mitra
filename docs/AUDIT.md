# Audit Teknis PSA Partnership Platform

Tanggal: 2026-11-20

## Stack dan tooling

| Layer | Pemakaian |
| --- | --- |
| Framework | Next.js `^16.4.1`, App Router, root `app/` |
| UI | React `^19.3.1`, Tailwind CSS `^4.3.3`, `lucide-react`, `motion` |
| Bahasa | TypeScript `^7.0.2`, `strict: false` |
| Bundler | Turbopack. `next dev` dan `next build` memakai Turbopack secara default di v16 |
| Database | Supabase Postgres memakai `@supabase/supabase-js ^2.117.3` dan `@supabase/ssr ^0.12.7` |
| ORM | Tidak ada Prisma, Drizzle, Knex, atau ORM lain. Schema dan seed berupa SQL di `supabase/migrations/` |
| Validasi | Manual di route handler, tanpa Zod/Yup |
| Email | Gmail API OAuth lewat `fetch`, helper di `lib/email/gmail.ts` |
| Test | `node --test`, satu file di `tests/file-signature.test.mjs` |
| Lint | `npm run lint` menjalankan `tsc --noEmit`, bukan ESLint |
| Build | `npm run build` menjalankan `next build` |
| Script Supabase | `supabase:start`, `supabase:stop`, `supabase:reset`, `supabase:types` |

Catatan: script `supabase:types` menulis ke `src/lib/supabase/database.types.ts`, sementara file yang dipakai project berada di `lib/supabase/database.types.ts`. Perbaikan script ini di luar scope audit ini.

## Struktur sumber

| Path | Isi |
| --- | --- |
| `app/page.tsx` | Beranda publik dan shell portal |
| `app/program/` | Katalog publik dan detail program |
| `app/auth/callback/route.ts` | Callback OAuth Supabase |
| `app/api/` | 23 route handler untuk auth, admin, partner, dan public |
| `src/App.tsx` | Router sisi klien lama untuk perpindahan tab portal |
| `src/context/AppContext.tsx` | State global, fetch workspace, dan aksi domain |
| `src/types/index.ts` | Tipe `User`, `PartnerOrganization`, `Program`, dan turunannya |
| `src/data/` | Data referensi wilayah dan fixture UI lama |
| `src/components/public/` | Landing, direktori program/mitra, registrasi, auth modal |
| `src/components/admin/` | Dashboard admin, review, analytics, follow-up email |
| `src/components/partner/` | Dashboard mitra, program, peserta, dokumen organisasi |
| `src/components/volunteer/` | Dashboard relawan, profil, dan pendaftaran program |
| `src/components/common/`, `src/components/layout/` | Modal, navbar, footer, status badge, portal layout |
| `lib/supabase/` | Client browser, server service role, guard admin/partner, tipe database |
| `lib/email/gmail.ts` | Pengirim email Gmail OAuth |
| `supabase/migrations/` | 8 migration SQL, termasuk schema, view publik, RLS, dan seed awal |

## Route API

| Grup | Route | Method | Fungsi |
| --- | --- | --- | --- |
| Auth | `/api/auth/profile` | GET | Profil user aktif |
| Auth | `/api/auth/change-password-complete` | POST | Ganti password awal mitra |
| Admin | `/api/admin/workspace` | GET | Seluruh data workspace admin |
| Admin | `/api/admin/partnership-applications` | GET, POST | Daftar dan buat pengajuan kemitraan |
| Admin | `/api/admin/partnership-applications/[id]` | PATCH | Review pengajuan kemitraan |
| Admin | `/api/admin/partners/[id]/account` | POST | Buat atau hubungkan akun mitra |
| Admin | `/api/admin/volunteer-registrations` | GET, PATCH | Daftar dan review relawan |
| Admin | `/api/admin/volunteer-applications/[id]` | PATCH | Review pendaftaran program |
| Admin | `/api/admin/programs/[id]` | PATCH | Review, publish, close, selesaikan program |
| Admin | `/api/admin/programs/[id]/reports` | GET, PATCH | Laporan pelaksanaan program |
| Admin | `/api/admin/notifications` | PATCH | Tandai notifikasi dibaca |
| Admin | `/api/admin/email-followups` | GET, POST | Follow-up email dan WhatsApp |
| Partner | `/api/partner/programs` | GET, POST, PATCH | Program mitra dan proposal |
| Partner | `/api/partner/programs/[id]` | PATCH | Progres pelaksanaan program |
| Partner | `/api/partner/programs/[id]/reports` | GET, POST | Laporan program |
| Partner | `/api/partner/applications/[id]` | PATCH | Rekomendasi pendaftar |
| Partner | `/api/partner/organization` | PATCH | Profil organisasi |
| Partner | `/api/partner/organization/documents` | GET, POST, DELETE | Dokumen organisasi |
| Partner | `/api/partner/program-media` | POST | Upload gambar program |
| Public | `/api/public/directory` | GET | Program published, mitra approved, timeline publik |
| Public | `/api/public/partnership-applications` | POST | Pengajuan kemitraan |
| Public | `/api/public/volunteer-registrations` | POST | Pendaftaran relawan |
| Public | `/api/public/programs/[id]/applications` | POST | Pendaftaran program publik |

Semua route handler mengekspor `runtime = 'nodejs'`. Route dinamis memakai `params` sebagai `Promise`, sesuai Next.js 16.

## Environment variables

Salin `.env.example` menjadi `.env.local`. Jangan commit `.env.local` dan jangan memakai `NEXT_PUBLIC_` untuk secret.

| Variabel | Scope | Status | Fungsi |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Wajib | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Wajib | Kunci anon untuk client dan alur auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Wajib | Akses server tanpa sesi, dipakai `/api/public/directory` dan operasi admin |
| `PORTAL_VOLUNTEER_ENABLED` | Server | Opsional, default `false` | Flag server portal relawan |
| `NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED` | Browser | Opsional, default `false` | Flag browser portal relawan, harus `true` bersama flag server |
| `GOOGLE_CLIENT_ID` | Server | Opsional | OAuth client Gmail |
| `GOOGLE_CLIENT_SECRET` | Server | Opsional | OAuth secret Gmail |
| `GOOGLE_REFRESH_TOKEN` | Server | Opsional | Refresh token Gmail |
| `GMAIL_FROM` | Server | Opsional | Alamat pengirim email |
| `GEMINI_API_KEY` | Server | Opsional | Tersedia di dependency, belum dipakai source saat ini |

`NEXT_PUBLIC_APP_URL` hanya disebut di `pland.md`, belum dibaca source, sehingga tidak dimasukkan ke `.env.example`.

## Catatan Next.js 16

- `proxy.ts` menggantikan `middleware.ts`. Project sudah memakai `proxy.ts` dengan export `proxy`.
- Akses `params`, `cookies()`, dan `headers()` harus di-`await`.
- `next lint` dihapus. Project memakai `tsc --noEmit`.
- Route Handler tidak di-cache secara default. Header `Cache-Control: no-store` di endpoint publik tetap dipertahankan.
- `export const runtime = 'nodejs'` valid di route handler, tidak di `proxy.ts`.

Panduan lokal yang dipakai: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` dan `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`.
