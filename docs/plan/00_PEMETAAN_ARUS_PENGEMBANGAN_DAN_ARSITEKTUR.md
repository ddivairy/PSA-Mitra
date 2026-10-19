# 🧭 Pemetaan Pengembangan & Arsitektur PSA Partnership Platform

**Tanggal Pembaruan:** 19 Oktober 2026  
**Status:** Blueprint Konsolidasi Arsitektur (Resolusi Kebingungan Sistem & Road to Production)

---

## 1. Analisis Masalah & Mengapa Sistem Terasa Memusingkan

Berdasarkan audit menyeluruh terhadap kode saat ini, ada 3 akar masalah yang menyebabkan alur platform terasa membingungkan:

### A. Tumpang Tindih Sumber Data (Dual-State: LocalStorage vs Supabase)
- **Komponen Lama:** Menggunakan `AppContext` yang membaca data tiruan (*mock*) dari `localStorage` (`INITIAL_USERS`, `INITIAL_PARTNERS`, `INITIAL_PROGRAMS`, dsb).
- **Komponen Baru:** Sebagian endpoint API (`/api/admin/...`) sudah terhubung ke database Supabase nyata, tetapi dashboard dan menu overview masih membaca state lokal.
- **Dampak:** Ketika data diubah di satu menu, menu lain tidak terupdate; data demo muncul berdampingan dengan data asli, menimbulkan kerancuan apakah aksi sudah tersimpan di database atau belum.

### B. Kerancuan Konsep Role (Seharusnya Hanya 2 Role Otentikasi)
- **Kondisi Sebelumnya:** Sistem mencoba membuat 3 portal terpisah: Portal Relawan, Portal Mitra, dan Dashboard Admin.
- **Klarifikasi Nyata:** Sistem sebenarnya **hanya membutuhkan 2 role yang memiliki akun & login**:
  1. **Admin PSA** (Pengelola platform, verifikasi berkas, persetujuan program, pengiriman email).
  2. **Mitra Organisasi** (Akun perwakilan resmi yang telah diverifikasi PSA untuk mengelola program kemitraan).
- **Pengguna Umum / Relawan:** **TIDAK memerlukan akun/portal login rumit**. Relawan mendaftar melalui formulir publik di website. Segala komunikasi, tiket pendaftaran, konfirmasi kehadiran, dan hasil seleksi dikirim langsung **lewat EMAIL** (dan WhatsApp).

### C. Halaman Admin Terpecah-pecah dan Kurang Informatif
- Admin dashboard saat ini memiliki terlalu banyak sub-menu yang saling tumpang tindih (`admin-dashboard`, `admin-overview`, `admin-partnerships`, `admin-proposals`, `admin-applications`, `admin-email-followups`, `admin-users-activity`).
- Admin harus berpindah-pindah tab hanya untuk melihat apakah ada berkas masuk, apakah email terkirim, atau bagaimana status program.
- Halaman admin seharusnya menjadi **Pusat Komando Informatif**: ringkas, metrik jelas, tabel antrean real-time, dan aksi verifikasi/email langsung dapat dieksekusi di tempat.

---

## 2. Definisi Arsitektur Final (2 Role + Public Intake)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PUBLIC WEBSITE                                  │
│  - Landing Page & Profile PSA                                              │
│  - Direktori Program Kolaborasi Terbuka                                     │
│  - Form Pendaftaran Relawan (Kirim data ke DB -> Relawan dapat Email)      │
│  - Form Pengajuan Kemitraan Baru (Upload Berkas -> Notifikasi Email)        │
└───────────────────────┬─────────────────────────────┬───────────────────────┘
                        │                             │
                        ▼                             ▼
┌───────────────────────────────────┐     ┌───────────────────────────────────┐
│         PORTAL MITRA (LOGIN)      │     │        ADMIN DASHBOARD (LOGIN)    │
│  Role: partner                    │     │  Role: admin                      │
│  - Profil Organisasi & Dokumen   │     │  - Ringkasan Metrik & KPI Utama   │
│  - Pengajuan Proposal Program     │     │  - Verifikasi Berkas & Mitra      │
│  - Daftar Program yang Dikelola   │     │  - Review & Publikasi Program     │
│  - Lihat Peserta Program Terpilih │     │  - Seleksi Relawan & Follow-up    │
│  - Pengaturan Akun & Password     │     │  - Log Email Terkirim via Gmail   │
└───────────────────────────────────┘     └───────────────────────────────────┘
```

### Rincian Hak Akses & Entitas:
| Pengguna | Memiliki Akun Login? | Kanal Interaksi Utama | Output Aksi |
|---|:---:|---|---|
| **Publik / Relawan** | ❌ Tidak | Form Pendaftaran Publik di Web | Menerima email konfirmasi, seleksi, & pengumuman program |
| **Mitra Organisasi** | ✅ Ya (diberikan setelah lolos verifikasi berkas) | Portal Mitra (`/mitra/...`) | Mengajukan proposal program, melihat daftar relawan yang lolos |
| **Admin PSA** | ✅ Ya (Akun internal PSA) | Dashboard Admin (`/admin/...`) | Memeriksa legalitas mitra, menyetujui program, mengirim email follow-up |

---

## 3. Struktur Halaman Admin yang Informatif & Efisien

Agar halaman admin tidak membingungkan, menu navigasi admin dirampingkan menjadi **4 pilar fungsional terpadu**:

```
[ ADMIN PSA DASHBOARD ]
 ├── 1. Overview & Operasional (Pusat Informasi & KPI Real-time)
 │      ├── Kartu Metrik Utama: Kemitraan Menunggu, Program Aktif, Total Relawan Masuk, Email Terkirim
 │      ├── Antrean Cepat: Butuh tindakan hari ini (Pengajuan baru & Proposal baru)
 │      └── Feed Aktivitas & Audit Trail Terakhir
 │
 ├── 2. Manajemen Kemitraan (Mitra & Organisasi)
 │      ├── Antrean Verifikasi: Tinjau berkas legalitas, profil PIC, catatan revisi
 │      ├── Aksi Putusan: Setujui (Otomatis generate akun Mitra), Minta Revisi, atau Tolak
 │      └── Direktori Mitra Resmi yang telah aktif
 │
 ├── 3. Manajemen Program & Peserta
 │      ├── Tinjau Proposal Program Kolaborasi dari Mitra
 │      ├── Kontrol Publikasi Program (Tayangkan ke Web Publik / Tutup Kuota)
 │      └── Data Pendaftar Program: Kelola status pendaftar relawan (Ditinjau / Diterima / Ditolak)
 │
 └── 4. Komunikasi & Email Follow-up
        ├── Kirim Email Manual/Template ke PIC Mitra & Calon Relawan
        ├── Log Riwayat Email (Terkirim, Gagal, Dibuka) via Gmail API
        └── Link WhatsApp Cepat (`wa.me`)
```

---

## 4. Penataan Ulang Database Supabase (Hapus LocalStorage)

Seluruh tabel database di Supabase sudah siap dan diterapkan:
1. `partnership_applications` & `partnership_application_documents`: Menampung pendaftaran kemitraan publik/offline.
2. `partner_organizations`: Organisasi yang telah disetujui resmi oleh Admin.
3. `programs`: Program kerja kolaborasi PSA & Mitra.
4. `volunteer_registrations`: Data relawan yang mendaftar program melalui form publik web.
5. `follow_up_logs`: Riwayat email & pesan WhatsApp yang dikirimkan Admin PSA.
6. `audit_logs`: Rekam jejak seluruh keputusan admin.
7. `users`: Akun autentikasi untuk Admin PSA dan PIC Mitra terverifikasi.

**Kebijakan Teknis:**
- Matikan sepenuhnya fallback `localStorage` pada alur Admin dan Mitra.
- Semua aksi Admin langsung melakukan mutasi via endpoint Next.js Server / Supabase Service Role.
- State di frontend langsung merefleksikan query database PostgreSQL secara reaktif.

