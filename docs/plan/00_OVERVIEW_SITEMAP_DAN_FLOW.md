# Arsitektur Informasi, Sitemap & Pemetaan Alur Pengguna
## PSA Partnership Platform

Dokumen ini mendefinisikan struktur hierarki halaman (*sitemap*), peran pengguna, dan transisi alur navigasi antarmuka.

---

## 1. Sitemap Komprehensif Platform

```
PSA PARTNERSHIP PLATFORM
│
├── 1. PUBLIC WEBSITE (Navigasi Header Atas + Footer)
│   ├── 1.1 Home / Landing Page
│   │   ├── Hero Banner & Headline Nilai Sosial
│   │   ├── Metrik Dampak Terverifikasi (Program, Relawan, Mitra, Provinsi)
│   │   ├── Kartu Program Kolaborasi Unggulan
│   │   ├── Panduan 4-Langkah Bergabung (Trek Relawan & Trek Mitra)
│   │   ├── Showcase Logo & Profil Mitra Terverifikasi
│   │   ├── Tanya Jawab Interaktif (FAQ)
│   │   └── Banner Ajakan Registrasi (CTA)
│   ├── 1.2 Tentang PSA
│   │   ├── Visi, Misi & Latar Belakang
│   │   └── 6 Prinsip Produk PSA (Jelas, Transparan, Terstruktur, Aman, Responsif, Aksesibel)
│   ├── 1.3 Katalog Program Kolaborasi (Programs Directory)
│   │   ├── Search Bar & Filter (Kategori, Format, Provinsi & Kota Bertingkat)
│   │   ├── Kartu Program & Status Kuota
│   │   └── Modal Detail Program (Objektif, Jadwal, Syarat, Aksesibilitas, Narahubung)
│   ├── 1.4 Direktori Mitra Terdaftar (Partners Directory)
│   │   ├── Filter Bentuk Organisasi (Korporasi CSR, Yayasan, Komunitas)
│   │   └── Kartu Profil Lembaga Terverifikasi & Jumlah Program Aktif
│   ├── 1.5 Menjadi Mitra (Become a Partner Landing)
│   │   ├── 4 Pilar Nilai Tambah Kemitraan
│   │   ├── Dokumen Persyaratan Awal Pengajuan
│   │   └── Alur 4 Tahap Kerja Sama
│   └── 1.6 Modal Autentikasi Terpadu (Auth Dialog)
│       ├── Tab Masuk Akun
│       ├── Tab Daftar Relawan
│       ├── Tab Daftar Mitra PIC
│       └── Layar Simulasi Verifikasi Email Akun
│
├── 2. VOLUNTEER PORTAL (Navigasi Sidebar Kiri Mandiri)
│   ├── 2.1 Dashboard & Ringkasan Relawan
│   │   ├── Banner Sambutan & Progres Kelengkapan Profil (%)
│   │   ├── 3 Kartu Metrik Partisipasi (Diterima, Menunggu Review, Total Lamaran)
│   │   ├── Antrean Aplikasi Terbaru
│   │   └── Rekomendasi Program Berdasarkan Minat / Domisili
│   ├── 2.2 Profil & Keahlian Relawan (Form Bertahap)
│   │   ├── Langkah 1: Informasi Pribadi & Opsi Gender Inklusif
│   │   ├── Langkah 2: Domisili Provinsi/Kota & Pilihan Minat Isu Sosial
│   │   └── Langkah 3: Riwayat Pengalaman, Keahlian & Ketersediaan Waktu
│   ├── 2.3 Aplikasi Saya (My Applications & Tracking)
│   │   ├── Kartu Status Pendaftaran dengan Kode Referensi (#APP-XXXX)
│   │   ├── Riwayat Perubahan Status (Linimasa Audit Trail Seleksi)
│   │   ├── Kotak Catatan Reviewer Penyelenggara
│   │   └── Tombol Tarik Lamaran Mandiri (Withdraw)
│   ├── 2.4 Eksplorasi Program Internal
│   │   └── Pencarian & Modal Pendaftaran Terintegrasi di dalam Portal
│   └── 2.5 Modal Pendaftaran Program (Apply Modal)
│       ├── Konfirmasi Data Profil Otomatis
│       ├── Input Pernyataan Motivasi
│       ├── Pertanyaan Khusus Penyelenggara
│       └── Persetujuan Komitmen Kehadiran
│
├── 3. PARTNER PORTAL (Navigasi Sidebar Kiri Khusus Organisasi)
│   ├── 3.1 Dashboard Mitra
│   │   ├── Banner Status Kemitraan Resmi (Approved / Revision Required / Under Review)
│   │   ├── 4 Kartu Metrik Inisiatif (Total Program, Aktif, Proposal Menunggu, Total Peserta)
│   │   ├── Daftar Program Kolaborasi
│   │   └── Pendaftar Relawan Masuk Terbaru
│   ├── 3.2 Profil & Legalitas Organisasi (Multi-Step Form)
│   │   ├── Banner Instruksi Revisi (jika status Perlu Revisi)
│   │   ├── Langkah 1: Identitas Lembaga & Sektor
│   │   ├── Langkah 2: Alamat Kantor & Narahubung PIC Resmi
│   │   ├── Langkah 3: Dokumen Legalitas (Dropzone Upload) & Komitmen Kemitraan
│   │   └── Langkah 4: Ringkasan & Tombol Kirim / Kirim Ulang Hasil Perbaikan
│   ├── 3.3 Program Kolaborasi (My Programs)
│   │   ├── Daftar Program Milik Organisasi
│   │   ├── Status Ganda: Status Proposal & Status Publikasi
│   │   └── Pengaturan Publikasi Cepat (Buka / Tutup Pendaftaran)
│   ├── 3.4 Modal Buat Proposal Program Baru (Create Proposal Modal)
│   │   ├── Langkah 1: Konsep & Objektif Kegiatan
│   │   ├── Langkah 2: Format, Jadwal, Kuota & Batas Pendaftaran
│   │   ├── Langkah 3: Narahubung PIC & Visual Sampul
│   │   └── Langkah 4: Review & Submit ke Antrean PSA
│   ├── 3.5 Manajemen Peserta & Relawan (Participants Management)
│   │   ├── Filter Berdasarkan Program & Status Seleksi
│   │   ├── Tabel Pendaftar Relawan
│   │   ├── Modal Keputusan Seleksi (Terima / Daftar Tunggu / Tolak + Catatan)
│   │   └── Tombol Ekspor Laporan CSV
│   └── 3.6 Analitik Program Mitra
│       ├── Rasio Keterisian Kuota Relawan
│       ├── Sebaran Gender Peserta (Grafik Agregat)
│       └── Sebaran Kota Asal Relawan (Grafik Batang)
│
└── 4. PSA ADMIN CONSOLE (Navigasi Sidebar Kiri Enterprise)
    ├── 4.1 Ikhtisar & Antrean Tindakan Mendesak
    │   ├── 4 Kartu Metrik Platform (Antrean Kemitraan, Proposal Baru, Mitra Aktif, Relawan)
    │   ├── Antrean Pengajuan Kemitraan Menunggu Evaluasi
    │   └── Antrean Proposal Program Menunggu Persetujuan
    ├── 4.2 Verifikasi Pengajuan Kemitraan (Partnership Review)
    │   ├── Tabel Antrean Berkas Organisasi Masuk
    │   └── Modal Peninjauan: Cek Legalitas, Dokumen Terunggah, dan Form Keputusan
    │       (Setujui Resmi / Minta Revisi Berkas / Tolak Kemitraan)
    ├── 4.3 Evaluasi Proposal Program (Proposal Review)
    │   ├── Tabel Proposal Program Masuk dari Mitra
    │   └── Modal Evaluasi: Cek Konsep, Jadwal, Kuota, dan Aksi Approval & Publikasi
    ├── 4.4 Pengawasan Seleksi Relawan Global
    │   └── Tabel Seluruh Pendaftar Lintas Program & Dialog Intervensi Seleksi
    ├── 4.5 Analitik Wilayah & Gender Nasional
    │   ├── Sebaran Provinsi Lokasi Program
    │   ├── Sebaran Kota Asal Relawan Se-Indonesia
    │   └── Demografi Gender Agregat Terstandar
    └── 4.6 Audit Trail & Log Aktivitas Sistem
        ├── Pencarian Log Aktivitas Berdasarkan Aktor / Waktu / Entitas
        └── Tabel Kronologis Transaksi Keputusan Approval & Perubahan Status
```

---

## 2. Matriks Pengalaman Visual Berdasarkan Peran

| Elemen Antarmuka | Pengunjung Publik | Relawan Terdaftar | Perwakilan Mitra | Admin PSA |
|---|---|---|---|---|
| **Navigasi Utama** | Header Horizontal Atas + Footer | Sidebar Kiri (Tema Biru) + Topbar | Sidebar Kiri (Tema Hijau/Emerald) + Topbar | Sidebar Kiri (Tema Navy/Gelap) + Topbar |
| **Akses Katalog Program** | Publik (Hanya Lihat Detail) | Melamar langsung lewat Modal | Mengelola program milik sendiri | Meninjau & menerbitkan proposal |
| **Akses Data Peserta** | Dibatasi (Tidak Ada) | Hanya melihat lamaran miliknya | Hanya melihat pelamar programnya | Melihat pendaftar seluruh platform |
| **Aksi Approval** | Tidak Ada | Tidak Ada | Menerima/menolak pelamar programnya | Menyetujui mitra, proposal, dan audit |
| **Peralihan ke Web Publik** | Default | Tombol "Web Publik" di sidebar/topbar | Tombol "Web Publik" di sidebar/topbar | Tombol "Web Publik" di sidebar/topbar |
