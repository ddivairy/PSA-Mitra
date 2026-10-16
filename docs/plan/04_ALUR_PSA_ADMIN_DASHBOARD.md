# Rencana UI/UX & Alur Pengguna: PSA Admin Console
## PSA Partnership Platform

**Kode Dokumen:** `FLOW-ADMIN-04` · **Fokus:** Pengalaman Administrator PSA, Antrean Review Kemitraan, Evaluasi Proposal, Analitik Nasional & Audit Trail

---

## 1. Alur Pengguna Administrator PSA (Admin Journey)

```
[ Masuk Konsol Admin PSA ]
         │
         ▼
[ Ikhtisar Dashboard Admin ] ──► (Terdapat Antrean Masuk)
         │
         ├──► [ Menu: Verifikasi Kemitraan Mitra ]
         │          │
         │          ├──► [ Buka Modal Tinjau Berkas Organisasi ]
         │          │       ├── Periksa Legalitas (Akta, NIB, Profil)
         │          │       ├── Periksa Kontak & Kewenangan PIC
         │          │       └── Tulis Catatan Keputusan
         │          │               │
         │          │               ├──► [ Aksi: SETUJUI KEMITRAAN ] ──► (Mitra Terverifikasi Resmi)
         │          │               ├──► [ Aksi: MINTA REVISI ]      ──► (Kirim Catatan ke Portal Mitra)
         │          │               └──► [ Aksi: TOLAK KEMITRAAN ]   ──► (Status Ditolak)
         │          │
         │          └──► (Otomatis Dicatat ke Audit Trail)
         │
         ├──► [ Menu: Program ]
         │          │
         │          ├──► [ Buka Modal Evaluasi Proposal ]
         │          │       ├── Cek Urgensi, Jadwal & Kualifikasi
         │          │       ├── Cek Rasionalitas Kuota & Keselamatan
         │          │       └── Tulis Catatan Review
         │          │               │
         │          │               ├──► [ Aksi: SETUJUI & PUBLIKASIKAN ] ──► (Tayang di Katalog Publik)
         │          │               ├──► [ Aksi: MINTA REVISI PROPOSAL ]  ──► (Kembali ke Draf Mitra)
         │          │               └──► [ Aksi: TOLAK PROPOSAL ]
         │          │
         │          └──► (Otomatis Dicatat ke Audit Trail)
         │
         ├──► [ Menu: Peserta ]
         │          ├── Ringkasan data pendaftar relawan lintas program
         │          └── Tinjau detail pendaftaran, domisili, gender, dan keputusan seleksi
         │
         ├──► [ Menu: Analytics ]
         │          ├── Statistik per mitra dan program
         │          ├── Distribusi gender pendaftar
         │          ├── Sebaran kota dan provinsi asal pendaftar
         │          └── Ekspor laporan CSV
         │
         └──► [ Menu: Users & Activity ]
                    ├── Daftar akun dan role pengguna
                    ├── Ringkasan cakupan hak akses per role
                    ├── Notifikasi platform dan status baca
                    └── Pelacakan kronologis aksi dan aktor melalui audit log
```

---

## 2. Struktur Tata Letak PSA Admin Console (`PortalLayout`)

Konsol dirancang dengan pendekatan antarmuka enterprise berkeamanan tinggi:

- **Sidebar Kiri ($260\text{px}$, Tema Gelap / Slate 900)**:
  - Header: Logo PSA, judul *"PSA Admin Console"*, dan subtitle *"Pusat Tata Kelola & Approval"*.
  - Profil Admin: Nama admin aktif (*Dewi Anjani*), status peran *"PSA Admin"*, badge avatar beraksen emas/amber.
  - Menu Navigasi Pengawasan:
    - *Overview* (Ringkasan statistik mitra, program, peserta, dan grafik status pendaftaran)
    - *Ikhtisar & Antrean* (Ikon Dashboard)
    - *Mitra* (Ikon Gedung, dilengkapi badge counter jumlah pengajuan yang menunggu review; mencakup verifikasi dokumen dan keputusan status kemitraan)
    - *Program* (Ikon Folder, dilengkapi badge counter proposal baru, halaman review/approval proposal dan tracking progres pendaftar)
    - *Peserta* (Ikon Pengguna; data pendaftar, distribusi gender, lokasi, dan detail seleksi)
    - *Analytics* (Ikon Grafik Analitik; statistik mitra/program, gender, kota, provinsi, dan ekspor laporan CSV)
    - *Users & Activity* (Ikon keamanan; akun/role, ringkasan hak akses, notifikasi, dan audit log)
  - Bagian Bawah: Tombol *"Kunjungi Website Publik"* dan *"Keluar (Logout)"*.
- **Topbar Atas**:
  - Breadcrumb dinamis posisi menu admin.
  - Lonceng notifikasi pengajuan baru dari mitra.
  - Tombol pintas ke Web Publik.

---

## 3. Rincian Antarmuka Fitur Admin

### 3.0 Overview Platform

Halaman ringkasan statistik ekosistem untuk membantu admin memantau jumlah mitra, program, peserta unik, dan pendaftaran. Overview menampilkan grafik doughnut distribusi pendaftar berdasarkan gender serta grafik kolom daerah asal pendaftar yang dibentuk otomatis dari data pendaftaran.

### 3.1 Dashboard Ikhtisar & Antrean Tindakan Mendesak

Halaman pemantau operasional harian admin:

1. **4 Kartu Metrik Tata Kelola**:
   - *Antrean Kemitraan*: Jumlah pengajuan organisasi berstatus `Submitted` atau `Under Review` yang butuh verifikasi.
   - *Proposal Program Baru*: Jumlah program kolaborasi yang menunggu persetujuan publikasi.
   - *Mitra Resmi Aktif*: Akumulasi organisasi yang telah lolos verifikasi legalitas PSA.
   - *Pendaftar Relawan*: Total aplikasi relawan yang terdaftar di seluruh ekosistem.
2. **Tata Letak 2 Kolom Antrean Mendesak**:
   - *Kolom Kiri*: Daftar pengajuan kemitraan terbaru yang belum diproses dengan tombol langsung ke modal review.
   - *Kolom Kanan*: Daftar proposal program kolaborasi terbaru yang diajukan oleh mitra.

---

### 3.2 Antarmuka Verifikasi Kemitraan (Partnership Review Queue)

Alur verifikasi legalitas organisasi:

- **Tabel Daftar Organisasi**:
  - Kolom: Nama Organisasi, Bentuk/Sektor Lembaga, Nama & Kontak PIC, Jumlah Berkas Terlampir, Status Kemitraan, dan Tombol Aksi *"Tinjau Berkas"*.
  - Filter Status: Semua, Terkirim Baru, Sedang Ditinjau, Perlu Revisi, Disetujui, Ditolak.
  - Search Bar: Pencarian instan berdasarkan nama instansi atau sektor.
- **Modal Peninjauan Kemitraan Komprehensif**:
  - *Panel Data Lembaga*: Nama resmi, jenis badan usaha, sektor, alamat kantor, provinsi, kota, dan website.
  - *Panel PIC*: Nama penanggung jawab, jabatan resmi, email, nomor WhatsApp.
  - *Panel Tujuan Kemitraan*: Alasan bermitra, target dampak sosial, dan fasilitas kontribusi yang ditawarkan.
  - *Panel Dokumen Legalitas*: Daftar dokumen terunggah dengan tombol inspeksi berkas PDF.
  - *Input Catatan Reviewer*: Textarea wajib diisi jika admin meminta revisi atau menolak (misal: *"Mohon lampirkan SK Kemenkumham terbaru dan jadwal perwakilan"*).
  - *3 Tombol Keputusan*:
    - **Tolak Kemitraan**: Warna merah muda berlatar lembut dengan dialog konfirmasi.
    - **Minta Revisi Dokumen**: Warna oranye peringatan; status berubah menjadi `Revision Required` dan catatan otomatis diteruskan ke portal mitra.
    - **Setujui Kemitraan Resmi**: Warna hijau emerald; status berubah menjadi `Approved`, membuka akses pembuatan program di portal mitra.

---

### 3.3 Evaluasi Proposal Program Kolaborasi (Program Proposal Review)

Alur kurasi dan penerbitan kegiatan:

- **Tabel Antrean Proposal**:
  - Kolom: Judul Program, Mitra Pengusul, Kategori & Format, Target Kuota Relawan, Status Proposal, Status Publikasi, dan Aksi *"Tinjau Proposal"*.
  - Pengaturan Status Publikasi Langsung: Dropdown inline untuk mengubah status publikasi (*Tayang Buka*, *Tutup Pendaftaran*, *Draf Sembunyi*).
- **Modal Evaluasi Proposal Program**:
  - *Panel Konsep*: Judul, kategori, format (tatap muka/daring), deskripsi masalah, capaian objektif.
  - *Panel Operasional*: Jadwal rinci kegiatan, alamat lokasi, batas akhir pendaftaran, kuota target, kualifikasi relawan, catatan aksesibilitas.
  - *Panel PIC Lapangan*: Narahubung pelaksana dari pihak mitra.
  - *Input Catatan Reviewer PSA*: Pesan pengarahan atau catatan koreksi konsep.
  - *Aksi Evaluasi*:
    - **Tolak Proposal**: Jika kegiatan bertentangan dengan kode etik PSA.
    - **Minta Revisi**: Jika kuota, jadwal, atau persyaratan perlu disesuaikan mitra.
    - **Setujui & Publikasikan Program**: Menyetujui proposal dan langsung menayangkannya ke katalog program publik.

---

### 3.4 Pengawasan Seleksi Relawan Global

Transparansi seleksi peserta:

- **Tabel Pendaftar Seluruh Platform**:
  - Menampilkan relawan terdaftar dari seluruh program dan mitra di Indonesia.
  - Filter berdasarkan program spesifik dan filter status seleksi.
  - Modal detail aplikasi: Memungkinkan admin mengawasi motivasi pendaftar dan memastikan mitra melakukan seleksi secara adil dan transparan.

---

### 3.5 Analitik Wilayah, Gender & Performa Nasional

Visualisasi terstruktur dalam 4 tab interaktif:

- **Tab 1 — Ikhtisar Ekosistem**: Metrik rasio keterisian kapasitas kuota per program dan persentase kelulusan seleksi.
- **Tab 2 — Sebaran Wilayah & Kota**:
  - Grafik batang peringkat kota asal pendaftar terbanyak se-Indonesia.
  - Grafik sebaran provinsi lokasi program berlangsung.
- **Tab 3 — Distribusi Gender & Demografi Agregat**:
  - Distribusi persentase gender terstandar (Laki-laki, Perempuan, Memilih Tidak Menjawab).
  - Catatan kepatuhan etika data: data tidak disimpulkan otomatis dari nama atau foto.
- **Tab 4 — Performa Mitra**: Matriks komparasi jumlah program per mitra dan total relawan yang berhasil digerakkan.

---

### 3.6 Audit Trail & Log Sistem (Audit Log UI)

Keamanan dan akuntabilitas keputusan:

- **Pencarian Log Real-time**: Input pencarian berdasarkan nama aktor, jenis aksi, atau teks catatan keputusan.
- **Tabel Kronologis Log Sistem**:
  - *Kolom Waktu*: Timestamp detail (Tanggal dan jam kegiatan).
  - *Kolom Aktor*: Nama pengguna pengambil tindakan dan label role (`admin`, `partner`, `volunteer`).
  - *Kolom Aksi*: Kode event terstandar (Contoh: `PARTNERSHIP_APPROVED`, `PROPOSAL_REVISION_REQUESTED`, `APPLICATION_ACCEPTED`).
  - *Kolom Entitas*: Tipe objek (`partnership`, `proposal`, `application`, `program`).
  - *Kolom Rincian Keputusan*: Teks lengkap deskripsi perubahan status dan catatan reviewer.
- **Sifat Data**: Ditampilkan dalam tabel berarsip tanpa tombol edit atau hapus untuk menjamin integritas jejak audit.
