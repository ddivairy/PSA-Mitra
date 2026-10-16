# 🚀 Rencana Deployment Terpadu (Deployment Plan)
## PSA Partnership Platform (PSA-Mitra)

Dokumen ini merupakan panduan komprehensif dan *checklist* operasional untuk merilis dan men-deploy **PSA Partnership Platform** ke lingkungan produksi (*Production Ready*). Disusun berdasarkan arsitektur Next.js 16 (Turbopack), Tailwind CSS v4, dan Supabase Backend (PostgreSQL + RLS + Storage).

---

## Daftar Isi
1. [Ringkasan Eksekutif & Status Kesiapan](#1-ringkasan-eksekutif--status-kesiapan)
2. [Matriks Konfigurasi & Environment Variables](#2-matriks-konfigurasi--environment-variables)
3. [Kesiapan Database & Backend (Supabase)](#3-kesiapan-database--backend-supabase)
4. [Strategi & Opsi Deployment](#4-strategi--opsi-deployment)
   - [Opsi A: Vercel (Rekomendasi Utama)](#opsi-a-vercel-rekomendasi-utama)
   - [Opsi B: Docker & Container (VPS / Coolify / Railway / GCP)](#opsi-b-docker--container-vps--coolify--railway--gcp)
   - [Opsi C: Node.js PM2 + Nginx Reverse Proxy](#opsi-c-nodejs-pm2--nginx-reverse-proxy)
5. [Otomasi CI/CD Pipeline (GitHub Actions)](#5-otomasi-cicd-pipeline-github-actions)
6. [Audit Keamanan, SEO, & Kinerja (Pre-Flight)](#6-audit-keamanan-seo--kinerja-pre-flight)
7. [Protokol Uji Verifikasi Pasca-Deploy (Smoke Test Checklist)](#7-protokol-uji-verifikasi-pasca-deploy-smoke-test-checklist)
8. [Monitoring, Backup, & Prosedur Rollback](#8-monitoring-backup--prosedur-rollback)
9. [Timeline & Jadwal Eksekusi Go-Live](#9-timeline--jadwal-eksekusi-go-live)

---

## 1. Ringkasan Eksekutif & Status Kesiapan

### 1.1 Status Kesiapan Rilis (*Release Readiness*)
| Parameter | Status | Catatan Verifikasi |
|---|:---:|---|
| **TypeScript Compilation** | VERIFIED (2026-10-16) | `npm.cmd run lint` menjalankan `tsc --noEmit` dan lolos |
| **Next.js Production Build** | VERIFIED (2026-10-16) | `npm.cmd run build` sukses setelah perubahan |
| **Lint & Format** | PARTIAL | Script `lint` menjalankan TypeScript check; formatter belum diverifikasi |
| **Skema Database & RLS** | PENDING CLOUD MIGRATION | File migrasi tersedia tetapi belum diterapkan ke project Supabase cloud |
| **Seeding Data Awal** | AVAILABLE | File seed dasar tersedia; verifikasi penerapan pada project Supabase sebelum deployment |
| **Fallback State Engine** | EXISTING | UI legacy masih memakai state lokal pada sebagian portal existing |
| **Ruang Pengguna** | PORTAL RELAWAN DITUTUP | Form intake relawan tetap aktif; Portal Mitra dan Admin tersedia |

### 1.2 Ringkasan Tumpukan Teknologi (*Tech Stack*)
- **Frontend Framework**: Next.js 16.4.1 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, Lucide React Icons, Motion (Framer Motion)
- **Backend / Database**: Supabase PostgreSQL 15+, Supabase SSR Client, GoTrue Auth
- **Keamanan**: Row Level Security (RLS), RBAC (Public, Volunteer, Partner, Admin), Middleware Cookie Handling

---

## 2. Matriks Konfigurasi & Environment Variables

Pastikan seluruh variabel lingkungan berikut telah dikonfigurasi di dashboard penyedia hosting sebelum melakukan deployment produksi:

| Nama Variabel | Tipe / Akses | Deskripsi | Wajib Produksi? |
|---|:---:|---|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | Publik (Client & Server) | URL endpoint proyek Supabase (contoh: `https://xxxx.supabase.co`) | **YA** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publik (Client & Server) | Kunci anonim Supabase dengan perlindungan RLS | **YA** |
| `SUPABASE_SERVICE_ROLE_KEY` | Rahasia (**Server Only**) | Kunci admin untuk migrasi, seeding, dan webhook server | **YA** |
| `NEXT_PUBLIC_APP_URL` | Publik | Domain resmi aplikasi (contoh: `https://mitra.psa.or.id`) | **YA** |
| `GEMINI_API_KEY` | Rahasia (**Server Only**) | Kunci Google AI Studio untuk fitur rekomendasi / analitik opsional | Opsional |
| `NODE_ENV` | Sistem | Set ke `production` | Otomatis |

> Catatan Keamanan Penting:
> - Jangan pernah melakukan `git commit` pada file `.env.local` atau file rahasia apapun.
> - Pastikan `.gitignore` tetap menyertakan `.env*`, `.next`, dan `node_modules`.

---

## 3. Kesiapan Database & Backend (Supabase)

Sebelum aplikasi dihubungkan secara live, backend Supabase di cloud wajib dipersiapkan:

### 3.1 Eksekusi Migrasi Skema
Terapkan migrasi DDL yang berada pada folder `supabase/migrations/`:
```bash
# Opsi 1: Menggunakan Supabase CLI
supabase login
supabase link --project-ref <your-project-ref>
supabase db push

# Opsi 2: Eksekusi Manual melalui Supabase Cloud Dashboard
# 1. Buka Supabase Studio > SQL Editor
# Jalankan seluruh migrasi berurutan:
# 20261015000000_initial_schema.sql
# 20261015000001_seed_initial_data.sql
# 20261016000000_email_followup_logs.sql
# 20261016000001_public_intake.sql
```

### 3.2 Pembuatan Bucket Storage
Buat bucket di menu **Supabase Studio > Storage**:
1. `partner-documents` (Private - Akses dibatasi untuk Mitra pemilik & Admin PSA).
2. `avatars` (Public - Foto profil pengguna).
3. `program-banners` (Public - Poster dan dokumentasi program kemitraan).

### 3.3 Verifikasi Kebijakan RLS (Row Level Security)
Pastikan RLS aktif pada seluruh tabel utama:
- `users`
- `volunteer_profiles`
- `partner_organizations`
- `partner_documents`
- `programs`
- `volunteer_applications`
- `audit_logs`
- `notifications`

---

## 4. Strategi & Opsi Deployment

### Opsi A: Vercel (Rekomendasi Utama)
Platform resmi pembuat Next.js dengan dukungan penuh zero-configuration dan Turbopack.

#### Langkah-langkah:
1. Hubungkan repositori GitHub/GitLab `PSA-Mitra` ke [Vercel Dashboard](https://vercel.com).
2. Konfigurasikan proyek:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (otomatis)
   - **Install Command**: `npm install`
3. Masukkan **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Klik **Deploy**.
5. Konfigurasikan **Custom Domain** (contoh: `kemitraan.psa.or.id`) dan aktifkan SSL otomatis.

---

### Opsi B: Docker & Container (VPS / Coolify / Railway / GCP)
Cocok jika instansi memiliki infrastruktur server sendiri atau menggunakan container orchestrator.

#### Konfigurasi `next.config.js`:
Pastikan output standalone diaktifkan untuk docker build ringan:
```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  // konfigurasi lainnya...
};
```

#### Multi-Stage `Dockerfile`:
```dockerfile
# 1. Dependencies Stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Builder Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3. Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Eksekusi Container:
```bash
# Build image
docker build -t psa-mitra:latest .

# Menjalankan container dengan file environment
docker run -d -p 3000:3000 --env-file .env.production --name psa-platform psa-mitra:latest
```

---

### Opsi C: Node.js PM2 + Nginx Reverse Proxy
Untuk deploy langsung pada Dedicated Server / VPS Ubuntu/Debian:
1. Pastikan Node.js 20 LTS terpasang.
2. Clone repo dan install dependencies:
   ```bash
   git clone <repo-url> /var/www/psa-mitra
   cd /var/www/psa-mitra
   npm ci
   npm run build
   ```
3. Kelola proses menggunakan **PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "psa-platform" -- start -- -p 3000
   pm2 save
   pm2 startup
   ```
4. Konfigurasikan **Nginx** sebagai reverse proxy port 3000 dengan sertifikat SSL Let's Encrypt (`certbot`).

---

## 5. Otomasi CI/CD Pipeline (GitHub Actions)

Buat file alur kerja `.github/workflows/deploy.yml` untuk memvalidasi kualitas kode secara otomatis pada setiap pull request dan rilis:

```yaml
name: PSA Mitra CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Type Check & Lint
        run: npm run lint

      - name: Run Next.js Production Build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        run: npm run build
```

---

## 6. Audit Keamanan, SEO, & Kinerja (Pre-Flight)

Lakukan verifikasi poin-poin berikut sebelum rilis:
- [x] **Remote Images Whitelist**: Domain gambar eksternal (`images.unsplash.com`, dll.) sudah terdaftar di `next.config.js`.
- [x] **Fonts & Asset Optimization**: Menggunakan font Google teroptimasi via `layout.tsx`.
- [x] **Security Headers**: Middleware (`proxy.ts`) siap menyaring dan memvalidasi cookie session GoTrue.
- [x] **Robots & Sitemap**: Akses portal internal (`/admin/*`, `/mitra/*`, `/relawan/*`) dibatasi dari indeks mesin pencari via `robots.txt` / meta tags.
- [x] **Sanitasi Data Input**: Validasi nomor telepon Indonesia, format email, dan batas ukuran file dokumen (maks 5MB).

---

## 7. Protokol Uji Verifikasi Pasca-Deploy (Smoke Test Checklist)

Jalankan pengujian skenario fungsional segera setelah aplikasi live di domain produksi:

### ?? 1. Public Website
- [ ] Halaman Beranda (`/`) memuat informasi hero, banner, dan program unggulan.
- [ ] Halaman Tentang PSA, Program, dan Direktori Mitra terbuka tanpa kesalahan console.
- [ ] Formulir "Jadi Mitra" dapat diakses dan tombol login/registrasi membuka modal otentikasi.

### ?? 2. Volunteer Portal
- [ ] Relawan dapat mendaftar akun baru dan menerima simulasi status verifikasi.
- [ ] Relawan dapat melengkapi profil 4 tahap (Data Diri, Minat & Skill, Riwayat & Bio).
- [ ] Relawan dapat mencari program dan mengirimkan aplikasi pendaftaran.
- [ ] Status aplikasi muncul pada tab "Aplikasi Saya" dengan pelacakan tahapan (Submitted -> Under Review).

### ?? 3. Partner Portal
- [ ] Perwakilan mitra dapat login dan mengisi profil organisasi serta PIC.
- [ ] Pengunggahan berkas legalitas dan profil lembaga berjalan lancar.
- [ ] Pengajuan kemitraan dapat dikirimkan ke status "Submitted / Under Review".
- [ ] Mitra yang telah disetujui dapat membuat proposal program baru dan melihat pendaftar relawan.

### ?? 4. PSA Admin Dashboard
- [ ] Admin dapat melihat kartu statistik ringkasan (Antrean Mitra, Proposal Program, Total Relawan).
- [ ] Admin dapat meninjau detail pengajuan kemitraan mitra (Aksi: Setujui, Minta Revisi, Tolak).
- [ ] Admin dapat mereview proposal program mitra dan mempublikasikannya ke katalog publik.
- [ ] Admin dapat menyeleksi relawan dan melihat grafik analitik demografi wilayah & gender.
- [ ] Seluruh aksi keputusan tercatat secara otomatis pada tabel **Audit Trail**.

---

## 8. Monitoring, Backup, & Prosedur Rollback

### 8.1 Pemantauan Operasional (Monitoring)
- **Vercel Analytics & Speed Insights**: Untuk pemantauan Core Web Vitals dan respon server.
- **Supabase Metrics**: Monitor utilisasi koneksi database pooling, REST queries, dan penyimpanan storage.
- **Uptime Monitoring**: Konfigurasikan pemantauan ketersediaan endpoint melalui Better Stack atau UptimeRobot.

### 8.2 Prosedur Pencadangan (Backup)
- Supabase secara otomatis mencadangkan database harian.
- Jalankan manual backup snapshot berkala sebelum melakukan perubahan skema besar:
  ```bash
  supabase db dump -f backup_$(date +%Y%m%d).sql
  ```

### 8.3 Rencana Pemulihan / Rollback (< 5 Menit)
Jika terjadi bug kritis pada versi terbaru:
1. **Di Vercel**: Buka tab **Deployments**, pilih build stabil sebelumnya, lalu klik tombol **Instant Rollback**.
2. **Di Docker**: Arahkan tag container kembali ke rilis sebelumnya (`psa-mitra:v1.0.0`) lalu restart container.
3. **Di Database**: Jika terjadi kesalahan migrasi, eksekusi file rollback script SQL yang telah disiapkan.

---

## 9. Timeline & Jadwal Eksekusi Go-Live

```
+-----------------+       +-----------------+       +-----------------+       +-----------------+
¦     H - 3       ¦  -->  ¦      H - 1      ¦  -->  ¦     HARI H      ¦  -->  ¦      H + 1      ¦
¦  Staging Test   ¦       ¦ Database Freeze ¦       ¦ Production Go   ¦       ¦ Monitoring UAT  ¦
+-----------------+       +-----------------+       +-----------------+       +-----------------+
```

1. **H - 3 (Staging & Final Validation)**:
   - Deploy staging build dan lakukan pengujian fungsional lintas 4 role.
   - Uji performa mobile dan koneksi internet lambat.
2. **H - 1 (Persiapan Lingkungan Produksi)**:
   - Eksekusi migrasi tabel dan seeding di Supabase Cloud Production.
   - Set up custom domain DNS record (`A` record / `CNAME`).
   - Verifikasi seluruh environment variables.
3. **HARI H (Go-Live Deployment)**:
   - Trigger production deployment ke Vercel / server.
   - Jalankan smoke test checklist secara menyeluruh (Section 7).
   - Umumkan peluncuran kepada stakeholder kemitraan PSA.
4. **H + 1 (Evaluasi & Post-Launch Support)**:
   - Pantau log error dan audit trail.
   - Verifikasi feedback awal dari relawan dan perwakilan mitra.

---

*Dokumen ini diperbarui secara berkala sebagai standar operasional rilis tim pengembang PSA Partnership Platform.*

## Adendum: Email Follow-up dan Status Portal

- Portal Relawan sementara tidak dapat diakses melalui route guard; formulir intake relawan dan seleksi admin tetap tersedia. Reaktivasi portal: set PORTAL_VOLUNTEER_ENABLED=true dan NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED=true lalu deploy ulang. Portal Mitra tetap aktif dan memakai Supabase Auth; tombol akun demo dihapus.
- Email follow-up admin memakai Gmail API OAuth dan hanya terkirim melalui aksi serta konfirmasi admin. Siapkan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN (scope gmail.send), dan GMAIL_FROM sebagai secret server.
- Akun admin harus diprovisikan di Supabase Auth dengan app_metadata.psa_role=admin; intake publik tidak membuat akun Auth. Akun mitra dibuat server hanya setelah admin menyetujui pengajuan.
- Terapkan migrasi 20261016000000_email_followup_logs.sql dan 20261016000001_public_intake.sql sebelum memakai intake, Storage, review, atau follow-up. Endpoint admin mensyaratkan sesi admin Supabase dan SUPABASE_SERVICE_ROLE_KEY server-side.
- Kredensial Gmail belum dikonfirmasi tersedia di environment saat audit. Status pengiriman hanya berasal dari respons Gmail API dan log database.
- Panduan lengkap: docs/plan/email-followup.md.
- Akun mitra disarankan per PIC resmi dengan email kerja organisasi; gunakan tabel membership/invitation jika beberapa PIC membutuhkan akses ke satu profil organisasi. Password awal saat ini mengikuti format nama organisasi + DDMMYYYY dan wajib diganti ketika login pertama; pola tersebut deterministik sehingga hanya boleh dibagikan kepada PIC melalui kanal terverifikasi.






