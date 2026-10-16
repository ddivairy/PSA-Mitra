# Panduan Peta Pengembangan UI/UX & Alur Pengguna
## PSA Partnership Platform

Dokumen ini memetakan perencanaan pengembangan berfokus **100% pada Alur Pengguna (User Flow), Arsitektur Halaman (Sitemap), Komponen UI/UX, dan Keberadaan Fitur** berdasarkan dokumen PRD v0.1 dan Panduan Desain PSA.

Seluruh spesifikasi teknis backend, database schema, dan integrasi server diabaikan pada dokumen ini untuk memastikan fokus penuh pada pengalaman pengguna (*User Experience*) dan antarmuka (*User Interface*).

> Catatan implementasi terbaru (2026-10): Portal Relawan sementara tertutup tetapi intake/seleksinya tetap berjalan; pengajuan mitra dan akun setelah approval memakai Supabase. Untuk status backend, migrasi wajib, Gmail, dan kebijakan akun terkini, lihat [Adendum deployment](./pland.md#adendum-email-follow-up-dan-status-portal) dan [panduan follow-up](./email-followup.md). Bagian alur lama di bawah tetap menjadi referensi desain, bukan gambaran akses portal aktif.

Status audit dan implementasi terbaru: [implementation-status.md](./implementation-status.md).

---

## 1. Struktur 4 Ruang Pengalaman Pengguna (User Spaces)

Platform dibagi secara tegas menjadi 4 area navigasi dan pengalaman visual:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. PUBLIC WEBSITE                               │
│  Home · Tentang PSA · Program Kolaborasi · Mitra · Jadi Mitra · Auth   │
└──────────────────┬─────────────────┬─────────────────┬─────────────────┘
                   │                 │                 │
     (Login Relawan)│    (Login Mitra)│      (Login Adm)│
                   ▼                 ▼                 ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│ 2. VOLUNTEER PORTAL  │ │  3. PARTNER PORTAL   │ │ 4. PSA ADMIN CONSOLE │
│   (Sidebar Khusus)   │ │   (Sidebar Khusus)   │ │   (Sidebar Khusus)   │
│                      │ │                      │ │                      │
│ · Dashboard Ringkasan│ │ · Dashboard Mitra    │ │ · Ikhtisar Antrean   │
│ · Profil Multi-Step  │ │ · Profil Organisasi  │ │ · Verifikasi Mitra   │
│ · Eksplorasi Program │ │ · Tracking Kemitraan │ │ · Review Proposal    │
│ · Form Lamar Program │ │ · Proposal Program   │ │ · Seleksi Relawan    │
│ · Aplikasi & Tracking│ │ · Seleksi Peserta    │ │ · Analitik Wilayah   │
│ · Notifikasi In-App  │ │ · Analitik Program   │ │ · Audit Trail Visual │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## 2. Indeks Dokumen Perencanaan Alur & UI/UX

| No | Dokumen | Fokus Utama Alur & UI/UX |
|---|---|---|
| **00** | [`00_OVERVIEW_SITEMAP_DAN_FLOW.md`](./00_OVERVIEW_SITEMAP_DAN_FLOW.md) | Arsitektur informasi global, sitemap lengkap, dan pemetaan peran pengguna |
| **01** | [`01_ALUR_PUBLIC_DAN_REGISTRASI.md`](./01_ALUR_PUBLIC_DAN_REGISTRASI.md) | Wireframe & alur halaman publik, form registrasi, dan simulasi verifikasi email |
| **02** | [`02_ALUR_VOLUNTEER_PORTAL.md`](./02_ALUR_VOLUNTEER_PORTAL.md) | Alur profil bertahap, eksplorasi & filter program, modal lamar, serta pelacakan status |
| **03** | [`03_ALUR_PARTNER_PORTAL.md`](./03_ALUR_PARTNER_PORTAL.md) | Alur profil lembaga, upload dokumen, alur perbaikan/revisi, pembuatan proposal & peserta |
| **04** | [`04_ALUR_PSA_ADMIN_DASHBOARD.md`](./04_ALUR_PSA_ADMIN_DASHBOARD.md) | Alur kerja peninjauan admin, keputusan approval/revisi, analitik wilayah/gender & audit log |
| **05** | [`05_STANDAR_UI_UX_DAN_STATE_VISUAL.md`](./05_STANDAR_UI_UX_DAN_STATE_VISUAL.md) | Standar desain visual, palet warna, tipografi, penanganan Empty/Loading/Error state |
| **Deploy** | [`pland.md`](./pland.md) | Checklist kesiapan produksi, konfigurasi environment, Supabase, deployment, CI/CD, smoke test, monitoring, backup, dan rollback |
| **Email Follow-up** | [`email-followup.md`](./email-followup.md) | Setup Gmail API, migrasi log, akses admin, dan aktivasi kembali portal user |

---

## 3. Prinsip UI/UX yang Ditegakkan

1. **Navigasi Terpisah Antar Peran**: Tidak mencampuradukkan bilah navigasi publik dengan navigasi internal portal relawan, mitra, dan admin.
2. **Kejelasan Aksi Berikutnya (Next-Step Clarity)**: Pengguna selalu memahami apa yang harus dilakukan setelah menyelesaikan suatu aksi (misal: setelah mendaftar -> verifikasi email -> lengkapi profil).
3. **Penyampaian Status Multi-Modal**: Status tidak boleh hanya disampaikan lewat warna saja, melainkan wajib disertai label teks eksplisit dan ikon status yang representatif.
4. **Form Bertahap Tanpa Beban Kognitif**: Form panjang (profil relawan, organisasi, proposal) dipecah menjadi langkah-langkah ringkas dengan progress bar dan fitur simpan draf.
