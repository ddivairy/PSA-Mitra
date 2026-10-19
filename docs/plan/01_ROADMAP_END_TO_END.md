# 🚀 Roadmap Pengembangan End-to-End PSA Partnership Platform

**Tanggal Pembaruan:** 19 Oktober 2026  
**Target:** Transformasi Penuh dari Prototipe LocalStorage ke Platform Produksi Terintegrasi Supabase

---

## Ringkasan Eksekutif Roadmap

| Fase | Fokus Utama | Luaran Kunci (*Deliverables*) | Estimasi Waktu |
|---|---|---|:---:|
| **Fase 1** | **Fondasi Data & Autentikasi** | Migrasi total dari `localStorage` ke Supabase SDK; standarisasi 2 role (`admin` & `partner`). | 1–2 Hari |
| **Fase 2** | **Admin Dashboard Informatif** | Restrukturisasi menu admin menjadi 4 modul terpadu; metrik real-time & antrean verifikasi terpusat. | 2–3 Hari |
| **Fase 3** | **Portal Mitra Mandiri** | Mitra login via Supabase Auth, ajukan proposal program kolaborasi, dan kelola peserta. | 2 Hari |
| **Fase 4** | **Intake Publik & Operasional Email** | Pendaftaran publik relawan/mitra langsung masuk DB; admin mengirim email notifikasi status. | 2 Hari |
| **Fase 5** | **Uji End-to-End & Deployment** | Uji coba skenario lengkap dari pendaftaran hingga persetujuan, audit security, go-live. | 1 Hari |

---

## Rincian Eksekusi Setiap Fase

### 📌 FASE 1: Fondasi Data & Konsolidasi Autentikasi (Supabase Nyata)
**Tujuan:** Menghapus ketergantungan pada dummy data di `localStorage` dan memastikan aplikasi membaca/menulis data langsung ke Supabase PostgreSQL.

1. **Pembersihan LocalStorage Fallback:**
   - Hapus pembacaan dan penulisan `psa_platform_data_v1_*` di `src/context/AppContext.tsx`.
   - Pastikan fetch data utama (users, partners, programs, applications) menggunakan endpoint API server yang terhubung ke Supabase.
2. **Pemurnian 2 Role Sistem:**
   - Sederhanakan tipe autentikasi menjadi hanya `admin` dan `partner` (serta `public` untuk pengunjung umum tanpa login).
   - Nonaktifkan/sembunyikan seluruh navigasi yang mengarah ke portal login relawan.
3. **Akun Bawaan Terverifikasi:**
   - Pastikan akun Admin PSA (`admin.partnership@psa-platform.org`) siap digunakan login via Supabase Auth dengan metadata `psa_role = 'admin'`.
   - Pastikan alur pembuatan akun mitra saat di-approve admin langsung membuat user di `auth.users` dan menghubungkannya ke `partner_organizations`.

---

### 📌 FASE 2: Restrukturisasi Halaman Admin (Pusat Komando Informatif)
**Tujuan:** Mengubah halaman admin yang membingungkan dan terpecah menjadi dashboard yang informatif, rapi, dan mudah dioperasikan.

1. **Konsolidasi Navigasi Admin (4 Menu Utama):**
   - **Menu 1: Ringkasan & KPI (`/admin/dashboard`):**
     - Total Pengajuan Menunggu (Mitra & Program).
     - Jumlah Mitra Aktif & Program Berjalan.
     - Total Pendaftar Relawan Publik.
     - Ringkasan aktivitas dan audit log terbaru.
   - **Menu 2: Verifikasi Mitra (`/admin/mitra`):**
     - Tabel antrean pengajuan kemitraan (baru, ditinjau, perlu revisi).
     - Modal detail organisasi, preview/download dokumen legalitas yang diunggah.
     - Tombol aksi: *Setujui & Buat Akun Mitra*, *Minta Revisi*, atau *Tolak*.
     - Input pencatatan mitra offline secara langsung oleh admin.
   - **Menu 3: Manajemen Program & Peserta (`/admin/program`):**
     - Review proposal program kolaborasi yang diajukan mitra.
     - Kontrol status publikasi (*Draft* -> *Published* -> *Selesai*).
     - Daftar pendaftar relawan per program: status seleksi (Diterima / Cadangan / Ditolak).
   - **Menu 4: Komunikasi & Follow-up Email (`/admin/email`):**
     - Template email resmi PSA: konfirmasi pengajuan, permintaan revisi berkas, pengumuman seleksi.
     - Pengiriman email via integrasi Gmail API ke PIC Mitra atau Relawan.
     - Riwayat status email (*sent*, *failed*, *opened*).
2. **Menghapus Tampilan Redundan:**
   - Menggabungkan `AdminOverview` dan `AdminDashboard` menjadi satu tampilan ringkas.
   - Menggabungkan `PartnershipReviewList` dan `AdminIntakeReview` menjadi satu antrean verifikasi terpadu.

---

### 📌 FASE 3: Portal Mitra Mandiri (Partner Workspace)
**Tujuan:** Memberikan ruang kerja bagi mitra resmi yang telah disetujui PSA untuk berkolaborasi secara transparan.

1. **Autentikasi Mitra:**
   - Mitra login menggunakan email PIC resmi dan password yang diberikan admin saat persetujuan.
   - Alur ganti kata sandi wajib saat login pertama kali (`/mitra/pengaturan-akun`).
2. **Pengajuan Proposal Kolaborasi:**
   - Form proposal program baru: judul, latar belakang, target dampak, kebutuhan relawan, lokasi, jadwal, dan rancangan anggaran.
   - Pelacakan status proposal: *Draft* -> *Ditinjau Admin* -> *Perlu Revisi* -> *Disetujui*.
3. **Pemantauan Peserta Program:**
   - Mitra dapat melihat daftar relawan yang telah disetujui untuk mengikuti program milik organisasi mereka.
   - Ekspor daftar peserta ke CSV/Excel untuk kebutuhan absensi lapangan.

---

### 📌 FASE 4: Alur Pendaftaran Publik & Notifikasi Email
**Tujuan:** Mempermudah publik mendaftar tanpa perlu login, dengan komunikasi otomatis berbasis email.

1. **Pendaftaran Kemitraan Baru (`/mitra/daftar` atau modal Become Partner):**
   - Form profil organisasi, kontak PIC, dan upload berkas legalitas (PDF/Gambar).
   - Berkas langsung masuk ke Supabase Storage bucket privat `partner-documents`.
   - Data masuk ke tabel `partnership_applications`.
   - PIC mitra menerima email konfirmasi bahwa berkas telah diterima dan sedang ditinjau.
2. **Pendaftaran Program untuk Relawan (`/program/[id]`):**
   - Calon relawan mengisi form singkat: nama, email, nomor WhatsApp, domisili, dan motivasi.
   - Data tersimpan di `volunteer_registrations`.
   - Relawan menerima email tiket/konfirmasi pendaftaran otomatis.
3. **Aksi Follow-up Admin ke Relawan:**
   - Ketika admin mengubah status pendaftar menjadi *Diterima*, admin dapat mengirim email resmi penerimaan beserta link grup koordinasi/briefing.

---

### 📌 FASE 5: Uji End-to-End, Security Audit, & Rilis Produksi
**Tujuan:** Memastikan seluruh sistem stabil, aman, dan siap digunakan PSA.

1. **Uji Skenario Alur Lengkap (*Happy Path*):**
   - Skenario A: Publik daftar mitra -> Admin review & approve -> Akun mitra dibuat -> Mitra login -> Mitra ajukan program -> Admin approve program -> Program tampil di publik.
   - Skenario B: Relawan daftar di program publik -> Data masuk ke antrean admin -> Admin seleksi diterima -> Relawan menerima email pemberitahuan.
2. **Security & Data Isolation:**
   - Uji RLS Supabase: Pastikan Mitra A tidak dapat melihat dokumen atau program milik Mitra B.
   - Pastikan endpoint Admin menolak request tanpa cookie autentikasi yang valid.
3. **Checklist Produksi:**
   - Build Next.js lolos tanpa error (`npm run build`).
   - Variabel lingkungan rahasia (`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_REFRESH_TOKEN`) aman di hosting server.

