# Rencana UI/UX & Alur Pengguna: Website Publik & Registrasi Akun
## PSA Partnership Platform

**Kode Dokumen:** `FLOW-PUBLIC-01` · **Fokus:** Pengalaman Pengunjung Publik, Halaman Promosi, Formulir Registrasi & Verifikasi Email

---

## 1. Alur Pengguna Pengunjung Publik (Visitor Journey)

```
[ Pengunjung Masuk ]
         │
         ├──► [ Jelajahi Landing Page / Home ]
         │          │
         │          ├──► [ Buka Katalog Program ] ──► [ Lihat Detail Program di Modal ]
         │          │                                           │
         │          │                                           ▼
         │          │                              [ Klik "Lamar Program" ]
         │          │                                           │ (Belum Login)
         │          │                                           ▼
         │          ├──► [ Buka Halaman "Menjadi Mitra" ] ──► [ Buka Modal Auth ]
         │          │                                           │
         │          └──► [ Buka Direktori Mitra Aktif ]         │
         │                                                      ▼
         └──► [ Klik Tombol "Masuk" / "Daftar" ] ──────► [ Pilih Tab Registrasi ]
                                                                │
                                                                ├──► [ Daftar Relawan ] ──► [ Verifikasi Email ] ──► [ Masuk Portal Relawan ]
                                                                │
                                                                └──► [ Daftar Mitra ]   ──► [ Verifikasi Email ] ──► [ Masuk Portal Mitra ]
```

---

## 2. Tata Letak Halaman & Komponen Publik

### 2.1 Halaman Beranda (Public Home / Landing)

Urutan seksi (*Section Hierarchy*) dirancang untuk memandu perhatian pengunjung:

1. **Header Publik Terpadu (`PublicNavbar`)**:
   - Wordmark PSA Partnership Platform di kiri.
   - Navigasi teks satu baris: *Beranda*, *Tentang PSA*, *Program Kolaborasi*, *Mitra Terdaftar*, *Menjadi Mitra*.
   - Zona Aksi Kanan: Tombol *"Masuk Akun"* dan tombol utama *"Daftar Relawan"*.
   - Jika pengguna sudah login: Menampilkan tombol *"Masuk ke Portal Saya"* dengan badge peran aktif.

2. **Hero Banner Section**:
   - Headline: *"Sinergi Nyata Relawan & Organisasi untuk Indonesia Berdaya"*.
   - Deskripsi manfaat sosial tanpa klaim berlebihan.
   - Tiga Tombol Aksi (CTA):
     - Primer: *"Jelajahi Program"* (Mengarahkan ke katalog).
     - Sekunder: *"Daftar Jadi Relawan"* (Membuka modal daftar relawan).
     - Tersier: *"Ajukan Kemitraan Mitra"* (Mengarahkan ke alur mitra).
   - Visual Hero: Foto dokumenter autentik kegiatan relawan pemuda Indonesia di lapangan (rasio 16:10 / 4:3) dengan perlindungan kontras teks.
   - Jalur Pembuktian (*Proof Strip*): Angka metrik terverifikasi (48+ Program, 3.400+ Relawan, 82+ Mitra, 12 Provinsi).

3. **Program Kolaborasi Unggulan (Featured Programs)**:
   - Menampilkan 3 kartu program aktif pilihan.
   - Elemen kartu: Foto sampul beresolusi tajam, badge kategori (Pendidikan, Lingkungan, Difabel), badge format (Offline/Online/Hybrid), lokasi kota, tanggal mulai, indikator rasio keterisian kuota relawan, dan tombol *"Detail Program"*.

4. **Panduan 4-Langkah Bergabung (Dual-Track Guide)**:
   - Memisahkan visual alur kerelawanan dan alur kemitraan agar calon mitra dan relawan tidak bingung:
     - *Trek Relawan*: Buat Akun & Verifikasi → Lengkapi Profil & Minat → Pilih & Lamar Program → Pantau Status di Dashboard.
     - *Trek Mitra*: Registrasi PIC → Lengkapi Profil & Legalitas → Review Admin PSA → Ajukan Proposal Kolaborasi.

5. **Showcase Mitra Terverifikasi & Testimoni**:
   - Menampilkan kartu institusi mitra yang telah berstatus *Approved*.
   - Badge *"Terverifikasi Resmi PSA"*.

6. **Tanya Jawab Interaktif (Interactive FAQ Accordion)**:
   - Accordion buka-tutup untuk pertanyaan penting (biaya program gratis, verifikasi akun vs kelulusan seleksi, alur revisi dokumen mitra).

7. **Footer Publik (`Footer`)**:
   - Informasi kantor resmi PSA di Jakarta, kontak email & WhatsApp resmi.
   - Navigasi sitemap lengkap, panduan kode etik, dan pernyataan kebijakan privasi data.

---

### 2.2 Halaman Katalog Program (Programs Directory)

Fitur antarmuka yang harus tersedia:

- **Search Bar Utama**: Input pencarian langsung untuk judul program, nama mitra, atau kata kunci (contoh: *mangrove, anak, digital*).
- **Filter Multivariabel Responsif**:
  - Pilihan Kategori: Semua, Pendidikan, Lingkungan, Kesehatan, Pemberdayaan Masyarakat, Teknologi & Digital.
  - Pilihan Format Pelaksanaan: Semua, Tatap Muka (Offline), Daring (Online), Kombinasi (Hybrid).
  - Pilihan Provinsi & Kota Dinamis: Memilih provinsi otomatis memperbarui opsi kota di bawahnya.
  - Urutkan Berdasarkan (*Sort*): Batas Pendaftaran Terdekat (*Deadline*) atau Program Terbaru.
- **Kartu Program (Program Card)**:
  - Tampilan visual, kuota pendaftar terisi / target kuota, lokasi, nama mitra pelaksana, dan batas pendaftaran dengan warna peringatan ramah aksesibilitas.
  - State indikator dinamis: Jika relawan sudah melamar -> Badge *"Sudah Mendaftar"*; Jika kuota penuh -> Label *"Kuota Penuh"*.
- **Modal Detail Program Komprehensif**:
  - Banner foto besar, ringkasan objektif, jadwal rinci pertemuan, kriteria persyaratan kehadiran, narahubung PIC, dan catatan fasilitas aksesibilitas (ramah kursi roda, bahasa isyarat, dll).
  - Tombol aksi utama: *"Daftar Sebagai Relawan"*.

---

### 2.3 Halaman Menjadi Mitra (Become a Partner Page)

Fitur dan seksi antarmuka:

- **Hero Khusus Kemitraan**: Visual kolaborasi profesional korporasi dan nirlaba di Jakarta.
- **4 Pilar Nilai Tambah Kemitraan**: Akses relawan terampil, jaminan verifikasi baku, dashboard manajemen peserta mandiri, publikasi dampak sosial.
- **Dokumen Persyaratan Awal**: Penjelasan format berkas yang wajib diunggah (Akta/NIB, Profil Lembaga, Surat Komitmen, SK PIC).
- **CTA Utama**: Tombol *"Ajukan Kemitraan Baru"* (mengarahkan langsung ke registrasi mitra).

---

## 3. Desain Modal Autentikasi & Verifikasi Email (Auth Modal UI/UX)

Modal tunggal adaptif dengan pergantian tab instan:

### 3.1 Tab "Masuk Akun"
- Field: Alamat Email dan Kata Sandi (dengan tombol ikon *Show/Hide Password*).
- Tombol aksi *"Masuk ke Akun"*.
- Tautan pemulihan *"Lupa Sandi?"*.
- Opsi Akun Demo Instan untuk pengujian cepat (Relawan Budi, Mitra PT Bumi, Admin PSA Dewi).

### 3.2 Tab "Daftar Relawan"
- Desain satu kolom untuk pemindaian mudah di ponsel maupun desktop.
- Field:
  - Nama Lengkap (Sesuai KTP).
  - Alamat Email Pribadi.
  - Nomor WhatsApp / Telepon.
  - Kata Sandi (Minimal 8 karakter).
  - Checkbox Persetujuan Syarat & Kebijakan Privasi Data PSA.
- Tombol aksi: *"Daftar Akun Relawan"*.

### 3.3 Tab "Daftar Mitra"
- Banner pemberitahuan visual: *"Akun dibuat untuk perwakilan resmi organisasi. Persetujuan kemitraan resmi akan diverifikasi oleh Admin PSA setelah profil dilengkapi"*.
- Field:
  - Nama Lengkap PIC / Narahubung.
  - Nama Resmi Organisasi / Lembaga / Perusahaan.
  - Email Kerja / Dinas.
  - Nomor Telepon / WA PIC.
  - Kata Sandi Akun.
  - Checkbox Pernyataan Kewenangan Mewakili Lembaga.
- Tombol aksi: *"Daftar Akun Mitra"*.

### 3.4 Layar Verifikasi Email (Email Verification Screen)
- Muncul otomatis setelah pengguna menekan tombol daftar.
- Ikon surat konfirmasi dengan status visual yang tenang.
- Penyamaran alamat email tujuan demi privasi: `bu***@gmail.com`.
- Informasi instruksi untuk memeriksa folder masuk / spam.
- Tombol *"Kirim Ulang Email Verifikasi"* dengan jeda waktu (*cooldown*).
- Tombol simulasi aktivasi instan untuk pengujian langsung tanpa meninggalkan halaman.
