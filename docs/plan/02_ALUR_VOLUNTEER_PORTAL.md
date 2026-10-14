# Rencana UI/UX & Alur Pengguna: Portal Relawan (Volunteer Portal)
## PSA Partnership Platform

**Kode Dokumen:** `FLOW-VOLUNTEER-02` · **Fokus:** Pengalaman Relawan, Pengisian Profil Bertahap, Alur Lamar Program & Pelacakan Status

---

## 1. Alur Pengguna Relawan (Volunteer User Journey)

```
[ Masuk Akun Relawan ]
         │
         ▼
[ Dashboard Relawan ] ─────── (Jika Profil < 80%) ───────► [ Formulir Profil Bertahap ]
         │                                                      │ (Langkah 1: Data Diri)
         │                                                      │ (Langkah 2: Domisili & Minat)
         │                                                      │ (Langkah 3: Keahlian & Waktu)
         │                                                      ▼
         ├──► [ Eksplorasi Program ]                     [ Profil Lengkap ]
         │          │                                           │
         │          ▼                                           │
         │    [ Buka Detail Program ] ◄─────────────────────────┘
         │          │
         │          ▼
         │    [ Klik "Lamar Program" ]
         │          │
         │          ▼
         │    [ Modal Lamar Program ]
         │       ├── Cek Ringkasan Profil Otomatis
         │       ├── Isi Pernyataan Motivasi
         │       ├── Jawab Pertanyaan Khusus Mitra
         │       └── Setujui Komitmen Kehadiran
         │          │
         │          ▼
         │    [ Submit Lamaran Sukses ]
         │          │
         │          ▼
         └──► [ Halaman "Aplikasi Saya" ]
                 ├── Lihat Status: Terkirim / Ditinjau / Diterima / Daftar Tunggu / Ditolak
                 ├── Baca Catatan Peninjau dari Mitra
                 ├── Pantau Linimasa Perubahan Status (Audit Trail)
                 └── Opsi Tarik Lamaran Mandiri (Withdraw)
```

---

## 2. Struktur Tata Letak Portal Relawan (`PortalLayout`)

Sesuai standar antarmuka portal kerja, Relawan mendapatkan tata letak **Sidebar Kiri Mandiri** tanpa elemen promosi website publik:

- **Sidebar Kiri ($260\text{px}$)**:
  - Header Portal: Logo PSA kecil, judul *"Portal Relawan PSA"*, dan badge *"Relawan Aktif"*.
  - Ringkasan Akun: Avatar inisial, nama relawan, dan status email terverifikasi.
  - Menu Navigasi:
    - *Dashboard & Ringkasan* (Ikon Dashboard)
    - *Aplikasi Saya* (Ikon Dokumen, dengan badge angka jumlah lamaran yang sedang aktif ditinjau)
    - *Profil & Keahlian* (Ikon User Check)
    - *Eksplorasi Program* (Ikon Pencarian)
  - Bagian Bawah Sidebar:
    - Tombol *"Kunjungi Website Publik"*
    - Tombol *"Keluar (Logout)"*
- **Topbar Atas**:
  - Breadcrumb dinamis (Contoh: `Portal Relawan / Aplikasi Saya`).
  - Bell Notifikasi dengan popover pembaruan seleksi program.
  - Tombol pintas ke Web Publik.

---

## 3. Rincian Antarmuka Fitur Relawan

### 3.1 Formulir Profil Bertahap (Volunteer Profile Step Form)

Formulir dirancang dalam 3 langkah agar relawan tidak merasa kewalahan:

1. **Header & Progress Stepper**:
   - Judul: *"Kelengkapan Profil Relawan"*.
   - Indikator Visual: Bar progres 3 segmen dengan label aktif (*1. Data Pribadi*, *2. Lokasi & Minat*, *3. Keterampilan & Jam*).
   - Label status: *"Langkah X dari 3"*.

2. **Langkah 1 — Informasi Pribadi**:
   - *Nama Lengkap*: Wajib diisi sesuai identitas KTP.
   - *Tanggal Lahir*: Pemilih tanggal untuk validasi kriteria usia program.
   - *Gender / Jenis Kelamin*: Dropdown tiga opsi inklusif (*Laki-laki*, *Perempuan*, *Memilih tidak menjawab*), disertai penjelasan bahwa data hanya digunakan untuk analitik agregat.
   - *Deskripsi Singkat / Bio*: Textarea untuk menceritakan latar belakang minat sosial.

3. **Langkah 2 — Domisili & Minat Kegiatan**:
   - *Provinsi Domisili*: Dropdown seluruh provinsi Indonesia.
   - *Kota / Kabupaten*: Dropdown yang otomatis menyesuaikan pilihan provinsi di atasnya.
   - *Pilihan Minat Kerelawanan*: Kotak pilihan (*checkbox card*) multiselect (Pendidikan, Lingkungan Hidup, Kesehatan, Pemberdayaan Masyarakat, Teknologi Digital, Seni Budaya, Tanggap Bencana).

4. **Langkah 3 — Keterampilan & Ketersediaan Waktu**:
   - *Pendidikan Terakhir / Profesi*: Input teks profesi atau institusi pendidikan saat ini.
   - *Keterampilan Utama*: Input tag keahlian (contoh: *Mengajar Anak, Fotografi, Public Speaking, P3K*).
   - *Pengalaman Volunteer Sebelumnya*: Textarea riwayat aksi sosial.
   - *Ketersediaan Waktu*: Dropdown pilihan ketersediaan (Akhir pekan Sabtu-Minggu / Hari kerja / Fleksibel).

5. **Tombol Navigasi Formulir**:
   - Tombol *"Sebelumnya"* (muncul di langkah 2 dan 3).
   - Tombol *"Simpan Draf"* (menyimpan isian sementara dan memunculkan toast konfirmasi).
   - Tombol *"Lanjutkan"* / *"Selesai & Simpan Profil"*.

---

### 3.2 Dashboard Relawan (Volunteer Dashboard)

Tampilan awal saat relawan login:

- **Banner Sapaan Ramah**: Nama relawan, ucapan selamat datang, dan status akun aktif.
- **Widget Progres Kelengkapan Profil**:
  - Bar progres persentase kelengkapan profil (0 - 100%).
  - Tombol aksi *"Lengkapi Profil"* atau *"Perbarui Profil"*.
- **3 Kartu Metrik Partisipasi**:
  - *Program Diterima*: Jumlah program di mana aplikasi telah lolos seleksi.
  - *Menunggu Seleksi*: Jumlah aplikasi yang sedang berstatus *Submitted* atau *Under Review*.
  - *Total Lamaran*: Riwayat kumulatif seluruh lamaran yang pernah diajukan.
- **Tata Letak 2 Kolom**:
  - *Kolom Kiri*: Daftar aplikasi terbaru dengan badge status warna ramah aksesibilitas.
  - *Kolom Kanan*: Rekomendasi program yang otomatis dicocokkan dengan minat atau domisili kota relawan.

---

### 3.3 Modal Pendaftaran Program (Apply Program Modal)

Alur lamaran cepat tanpa entri ulang data dasar:

1. **Header Modal**: Judul program yang dilamar dan nama mitra penyelenggara.
2. **Strip Konfirmasi Data Profil**: Menampilkan data dasar relawan (Nama, Email, Kota Asal) secara otomatis agar relawan yakin datanya benar.
3. **Pernyataan Motivasi**: Textarea wajib yang menjelaskan alasan mendaftar dan kontribusi yang ingin diberikan.
4. **Pertanyaan Khusus Mitra**: Field kustom dari mitra (misal: pengalaman fisik di lapangan, kepemilikan laptop untuk program digital).
5. **Persetujuan Komitmen**: Checkbox komitmen kehadiran penuh selama jadwal kegiatan.
6. **Aksi Submit**: Tombol *"Kirim Pendaftaran"* dengan penanganan loading state dan pencegahan klik ganda.

---

### 3.4 Halaman "Aplikasi Saya" & Pelacakan Status

Fitur transparansi pelacakan seleksi:

- **Kode Referensi Unik**: Setiap aplikasi memiliki kode referensi unik (contoh: `REF: #APP-001`).
- **Badge Status Resmi**:
  - `Terkirim (Submitted)`: Biru muda dengan ikon dokumen.
  - `Sedang Ditinjau (Under Review)`: Kuning amber dengan ikon jam pasir berdenyut lembut.
  - `Diterima (Accepted)`: Hijau emerald dengan ikon centang sukses.
  - `Daftar Tunggu (Waitlisted)`: Ungu dengan ikon peringatan daftar antrean.
  - `Ditolak (Rejected)`: Merah muda dengan ikon silang dan penjelasan sopan.
  - `Dibatalkan (Withdrawn)`: Abu-abu netral.
- **Kotak Catatan Penyelenggara**: Jika mitra meninggalkan pesan feedback atau instruksi persiapan, catatan tersebut tampil jelas dalam callout box berwarna sesuai status.
- **Linimasa Riwayat Audit (Timeline)**: Accordion buka-tutup yang menampilkan kronologi kapan lamaran terkirim, kapan ditinjau, dan kapan keputusan diambil beserta nama aktor peninjau.
- **Aksi Tarik Lamaran Mandiri**: Tombol *"Tarik Lamaran"* aktif saat status masih `Submitted` atau `Under Review`, memungkinkan relawan membatalkan secara sukarela jika jadwal berhalangan.
