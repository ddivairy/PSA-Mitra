# Rencana UI/UX & Alur Pengguna: Portal Mitra (Partner Portal)
## PSA Partnership Platform

**Kode Dokumen:** `FLOW-PARTNER-03` · **Fokus:** Pengalaman Organisasi Mitra, Pengajuan Kemitraan, Alur Revisi Berkas, Proposal Kolaborasi & Manajemen Peserta

---

## 1. Alur Pengguna Mitra Baru (Partner Journey)

```
[ Masuk Akun Mitra ]
         │
         ▼
[ Dashboard Mitra ] ──► (Status: Draft / Belum Lengkap) ──► [ Lengkapi Profil Organisasi ]
         │                                                      │ (Langkah A: Info Lembaga)
         │                                                      │ (Langkah B: Alamat & PIC)
         │                                                      │ (Langkah C: Unggah Dokumen)
         │                                                      │ (Langkah D: Review & Submit)
         │                                                      ▼
         │                                             [ Status: Submitted ]
         │                                                      │
         │                                                      ▼ (Peninjauan oleh Admin PSA)
         ├──◄───────────────────────────────────────────────────┼─────────────────────────────────────┐
         │                                                      │                                     │
         ▼ (Status: Revision Required)                          ▼ (Status: Approved)                  ▼ (Status: Rejected)
[ Banner Permintaan Revisi ]                   [ Kemitraan Terverifikasi Resmi ]              [ Notifikasi Penolakan ]
         │                                                      │
         ▼                                                      ▼
[ Form Edit & Resubmit ]                       [ Buka Fitur Proposal Program ]
         │                                                      │
         ▼                                                      ▼
[ Kirim Ulang Hasil Perbaikan ]                [ Modal Buat Proposal Kolaborasi ]
                                                                │ (Langkah 1: Konsep & Objektif)
                                                                │ (Langkah 2: Jadwal & Kuota)
                                                                │ (Langkah 3: PIC & Visual Sampul)
                                                                │ (Langkah 4: Submit Proposal)
                                                                ▼
                                                       [ Program Disetujui & Tayang ]
                                                                │
                                                                ├──► [ Kelola Publikasi Program ]
                                                                │
                                                                ├──► [ Tinjau & Seleksi Peserta ]
                                                                │       ├── Terima / Daftar Tunggu / Tolak
                                                                │       └── Ekspor Laporan CSV
                                                                │
                                                                └──► [ Pantau Analitik Demografi ]
```

---

## 2. Struktur Tata Letak Portal Mitra (`PortalLayout`)

Tata letak khusus organisasi dengan identitas branding profesional:

- **Sidebar Kiri ($260\text{px}$)**:
  - Header Portal: Logo PSA, judul *"Portal Mitra Organisasi"*, dan nama lembaga aktif.
  - Profil PIC: Nama lengkap PIC, jabatan di lembaga, dan badge *"Mitra PIC"*.
  - Menu Navigasi Utama:
    - *Dashboard Mitra* (Ikon Dashboard)
    - *Program Kolaborasi* (Ikon Folder Kegiatan)
    - *Data Relawan / Peserta* (Ikon Pengguna)
    - *Analitik Program* (Ikon Grafik Analitik)
    - *Profil & Legalitas Lembaga* (Ikon Gedung Lembaga)
  - Bagian Bawah: Tombol *"Kunjungi Website Publik"* dan *"Keluar"*.
- **Topbar Atas**:
  - Breadcrumb navigasi portal.
  - Lonceng notifikasi pembaruan review proposal atau aplikasi relawan baru.
  - Tombol pintas ke Web Publik.

---

## 3. Rincian Antarmuka Fitur Mitra

### 3.1 Formulir Profil Organisasi & Dokumen Legalitas (Multi-Step Form)

Formulir 4 langkah terstruktur untuk verifikasi kredibilitas institusi:

1. **Banner Catatan Revisi (Muncul Hanya Jika Status = `Revision Required`)**:
   - Kotak peringatan oranye berlatar kontras tinggi.
   - Menampilkan catatan spesifik dari reviewer Admin PSA (contoh: *"Mohon lengkapi surat tugas PIC dan jadwal rinci pelaksanaan"*).
   - Penjelasan bahwa field dapat langsung diedit di formulir bawah ini.

2. **Langkah A — Identitas Organisasi**:
   - *Nama Resmi Lembaga / Perusahaan*: Wajib sesuai badan hukum.
   - *Bentuk Organisasi*: Pilihan dropdown (*Perusahaan CSR, Yayasan Nirlaba, Komunitas Sosial, Perguruan Tinggi, Sekolah*).
   - *Sektor Kegiatan*: Bidang keahlian (contoh: Lingkungan Hidup, Pendidikan Anak, Difabel).
   - *Deskripsi Lembaga*: Profil visi, misi, dan portofolio kegiatan 1 tahun terakhir.
   - *Website Resmi / Kanal Media Sosial*: URL resmi institusi.

3. **Langkah B — Alamat Kantor & Narahubung PIC**:
   - *Alamat Kantor*: Alamat lengkap sekretariat atau gedung kantor.
   - *Provinsi & Kota*: Pilihan bertingkat master wilayah Indonesia.
   - *Data PIC Resmi*: Nama lengkap penanggung jawab, jabatan, email kerja dinas, dan nomor WhatsApp aktif.

4. **Langkah C — Komitmen Kemitraan & Unggah Dokumen Legalitas**:
   - *Alasan Bermitra*: Esai singkat alasan memilih kolaborasi bersama PSA.
   - *Target Dampak*: Target capaian kelompok penerima manfaat.
   - *Kontribusi yang Ditawarkan*: Bentuk fasilitas (pendanaan bibit, modul belajar, konsumsi relawan).
   - *Dropzone Dokumen Pendukung*:
     - Komponen upload interaktif dengan format file PDF (Maks. 5 MB).
     - Daftar dokumen yang sudah terunggah dengan metadata nama file, ukuran, tanggal unggah, dan tombol hapus/ganti berkas sebelum submit.
     - Simulasi berkas resmi (Akta Pendirian, NIB, SK Kemenkumham, Surat Komitmen).

5. **Langkah D — Review & Pernyataan Keabsahan**:
   - Rangkuman seluruh data yang diisi dalam format ringkas.
   - Pernyataan persetujuan bahwa dokumen yang dilampirkan adalah sah dan dapat dipertanggungjawabkan.
   - Tombol *"Simpan Draf"*, *"Kembali"*, dan *"Kirim Pengajuan Kemitraan"* (atau *"Kirim Ulang Hasil Perbaikan"* jika mode revisi).

---

### 3.2 Dashboard Mitra (Partner Dashboard)

Pusat kendali dan status kemitraan organisasi:

1. **Banner Status Kemitraan Dinamis**:
   - *Status Disetujui (Approved)*: Banner hijau dengan status resmi terverifikasi dan tombol aktif *"Buat Proposal Program Baru"*.
   - *Status Perlu Revisi (Revision Required)*: Banner oranye dengan tombol cepat *"Perbaiki Dokumen Sekarang"*.
   - *Status Menunggu Review (Under Review / Submitted)*: Banner biru dengan penjelasan estimasi waktu verifikasi 1-3 hari kerja.

2. **4 Kartu Metrik Inisiatif**:
   - *Total Program*: Jumlah seluruh inisiatif yang pernah dirancang organisasi.
   - *Program Aktif Tayang*: Program yang sedang dibuka pendaftarannya di katalog publik.
   - *Proposal Menunggu Review*: Proposal program yang sedang dalam antrean evaluasi Admin PSA.
   - *Total Relawan Terdaftar*: Akumulasi pendaftar lintas program milik mitra.

3. **Daftar Program & Pendaftar Relawan Masuk**:
   - Menampilkan status proposal setiap program dan jumlah kuota pendaftar yang telah terisi.
   - Tabel pelamar relawan terbaru dengan aksi cepat untuk meninjau berkas.

---

### 3.3 Modal Pembuatan Proposal Kolaborasi (Create Proposal Modal)

Alur 4 tahap perancangan program oleh mitra yang telah disetujui:

1. **Langkah 1 — Konsep & Objektif Kegiatan**:
   - Judul program kolaborasi (jelas dan memotivasi relawan).
   - Kategori bidang (Pendidikan, Lingkungan, Kesehatan, Masyarakat, Digital).
   - Ringkasan singkat kartu program (1-2 kalimat).
   - Deskripsi lengkap urgensi program dan latar belakang masalah.
   - Tujuan capaian terukur (output kegiatan per baris).

2. **Langkah 2 — Rencana Eksekusi**:
   - Format: Tatap Muka (Offline), Daring (Online), atau Kombinasi (Hybrid).
   - Lokasi: Provinsi, kota, dan alamat lengkap tempat pelaksanaan kegiatan.
   - Tanggal mulai, tanggal selesai, dan batas akhir pendaftaran (*deadline*).
   - Jadwal rinci (hari dan jam kegiatan).
   - Target kuota relawan yang dibutuhkan.
   - Kriteria dan persyaratan relawan per poin.
   - Catatan aksesibilitas (ramah kursi roda, disabilitas, lansia).

3. **Langkah 3 — PIC Pelaksana & Visual Sampul**:
   - Nama dan kontak telepon PIC khusus kegiatan lapangan.
   - Pemilihan visual kartu program bertema relevan (Edukasi, Lingkungan Hidup, Pemberdayaan Masyarakat).

4. **Langkah 4 — Pratinjau & Submit Proposal**:
   - Menampilkan pratinjau kartu dan ringkasan proposal.
   - Tombol *"Kirim Proposal ke PSA"*.

---

### 3.4 Manajemen Peserta & Relawan (Participants Management)

Fitur untuk memilih dan mengelola relawan:

- **Filter Multivariabel**: Filter program milik mitra dan filter status pendaftar (Semua, Terkirim Baru, Sedang Ditinjau, Diterima, Daftar Tunggu, Ditolak).
- **Search Bar Peserta**: Pencarian instan nama relawan, email, atau domisili.
- **Tabel Pendaftar Relawan**: Nama pendaftar, domisili, tanggal daftar, status pendaftaran, dan tombol aksi *"Tinjau & Keputusan"*.
- **Modal Keputusan Seleksi (Review Modal)**:
  - Membaca biodata ringkas, motivasi relawan, dan jawaban pertanyaan tambahan.
  - Input catatan keputusan (misal: link grup koordinasi WhatsApp untuk yang diterima, atau alasan untuk yang ditolak).
  - 3 Tombol Aksi: *"Terima Relawan"*, *"Masukkan Daftar Tunggu"*, dan *"Tolak Pendaftaran"*.
- **Tombol Ekspor Laporan CSV**: Mengunduh seluruh daftar relawan terdaftar sesuai filter ke file format `.csv` untuk koordinasi teknis tim di lapangan.

---

### 3.5 Analitik Program Mitra (Partner Analytics View)

Visualisasi ringkas dampak program organisasi:

- **Rasio Keterisian Kuota**: Persentase kapasitas relawan yang berhasil dihimpun dibanding target.
- **Sebaran Gender Peserta (Agregat)**: Grafik batang horizontal ramah privasi yang menampilkan proporsi gender relawan terdaftar.
- **Sebaran Asal Kota Relawan**: Grafik peringkat 5 kota asal terbanyak pendaftar program mitra.
