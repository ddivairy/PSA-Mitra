# Panduan Portal Mitra

Dokumen ini menjelaskan halaman dan fungsi yang tersedia untuk akun organisasi mitra PSA. Rute portal dikelola dari [`app/page.tsx`](../app/page.tsx), sedangkan menu workspace ditampilkan oleh [`PortalLayout.tsx`](../src/components/layout/PortalLayout.tsx).

## Alur umum mitra

1. Masuk ke portal dengan akun mitra yang sudah ditautkan ke organisasi.
2. Lengkapi profil organisasi dan kirim pengajuan kemitraan bila status organisasi masih berupa draf atau memerlukan perbaikan.
3. Tunggu review Admin PSA. Jika diminta revisi, perbarui informasi dan kirim kembali.
4. Setelah kemitraan disetujui, ajukan proposal program.
5. Pantau program, pendaftar relawan, dan statistik partisipasi organisasi.

## Ringkasan navigasi

| Halaman | Rute | Fungsi utama |
|---|---|---|
| Dashboard | `/mitra/dashboard` | Status organisasi, pintasan, ringkasan program dan agenda |
| Program Kolaborasi | `/mitra/program` | Daftar program dan pengajuan proposal baru |
| Data Relawan | `/mitra/relawan` | Pencarian, filter, review peserta, dan ekspor CSV |
| Analitik Program | `/mitra/analitik` | Statistik aplikasi, gender, dan domisili untuk organisasi |
| Profil Organisasi | `/mitra/organisasi` | Mengisi atau memperbarui profil dan pengajuan kemitraan |
| Pengaturan Akun | `/mitra/pengaturan-akun` | Mengubah kata sandi atau meminta tautan reset |

## Halaman dan fitur

### 1. Dashboard Mitra

- Menampilkan nama organisasi, PIC, sektor, dan status kemitraan.
- Menampilkan banner status. Mitra yang disetujui memperoleh pintasan untuk mengajukan program; status lain menampilkan informasi review.
- Memberi pintasan ke profil organisasi, daftar program, peserta, Analytics, dan halaman panduan/profil.
- Menyajikan ringkasan program organisasi, status proposal, kategori, lokasi, tanggal mulai, jumlah aplikasi dibanding kuota, serta pintasan **Lihat Peserta**.
- Memuat panel progres, agenda/tugas, notifikasi, kalender, dan ringkasan efektivitas rekrutmen.

**Catatan data:** daftar program, jumlah pendaftar, antrean tugas, dan metrik dashboard diambil dari workspace mitra. Program tanpa kuota menampilkan target sebagai tidak dibatasi.

### 2. Program Kolaborasi

- Menampilkan kartu program milik organisasi, kategori, ringkasan, lokasi, tanggal mulai, status proposal, dan pendaftar dibanding kuota.
- Menampilkan pesan dan keadaan kosong jika organisasi belum memiliki program.
- Menyediakan pengajuan proposal baru untuk organisasi berstatus disetujui.
- Admin mengendalikan publikasi; mitra tidak dapat menerbitkan atau menyembunyikan program sendiri.
- Untuk program yang telah terbit, mitra dapat memajukan tahap pelaksanaan secara berurutan, menambahkan pengumuman publik, dan mengirim laporan/dokumentasi.
- Laporan disimpan privat, mendapat status review admin, serta menampilkan catatan revisi bila dikembalikan.

Perubahan status publikasi bergantung pada otorisasi server. Jika tindakan ditolak, ikuti pesan aplikasi dan hubungi Admin PSA untuk perubahan status yang memerlukan akses admin.

### 3. Pengajuan Proposal Program

Formulir proposal memakai empat langkah:

1. **Informasi Dasar:** judul, kategori, ringkasan, deskripsi, dan tujuan program.
2. **Rencana Eksekusi:** format kegiatan, lokasi sesuai format, tanggal, jadwal, kuota, tenggat pendaftaran, persyaratan, dan informasi aksesibilitas.
3. **PIC & Media:** nama/kontak PIC dan gambar program.
4. **Review & Kirim:** meninjau data lalu mengirim proposal untuk diperiksa oleh Admin PSA.

Kolom wajib diperiksa sebelum pengguna dapat maju antar langkah. Proposal yang diajukan masuk ke status menunggu review; persetujuan admin diperlukan sebelum program dipublikasikan.

### 4. Data Relawan

- Hanya menampilkan aplikasi untuk program milik organisasi mitra yang sedang aktif.
- Mencari berdasarkan nama, email, judul program, atau kota.
- Memfilter berdasarkan program dan status.
- Mengelompokkan aplikasi menjadi belum diterima, diterima, ditolak, dan mengundurkan diri.
- Membuka detail peserta untuk melihat kontak, domisili, motivasi, jawaban tambahan, serta catatan review.
- Memberi rekomendasi diterima, daftar tunggu, atau ditolak dengan catatan opsional. Ini bukan keputusan final.
- Mengekspor aplikasi yang cocok dengan pencarian/filter ke CSV.

Tindakan review memerlukan sesi dan izin yang sesuai pada server. Bila server menolak perubahan, rekomendasi belum tersimpan; periksa pesan error dan koordinasikan dengan Admin PSA.

Rekomendasi mitra dicatat terpisah dari keputusan final. Admin PSA yang menetapkan hasil seleksi dan memicu email keputusan.

### 5. Analitik Program

Analitik dibatasi pada program organisasi mitra:

- Jumlah pendaftar lintas program.
- Jumlah relawan yang diterima.
- Rasio pendaftar terhadap total target kuota.
- Distribusi gender dalam bentuk agregat.
- Sebaran peserta berdasarkan provinsi dan kota/kabupaten.

Jika data provinsi pada pendaftaran tidak tersedia, tampilan mencoba mencocokkan kota ke daftar wilayah yang dikenal; wilayah yang tidak dapat dipetakan ditampilkan sebagai tidak diketahui. Data demografi disajikan secara agregat dan tidak boleh ditafsirkan sebagai identifikasi individu.

### 6. Profil Organisasi

Formulir terdiri dari empat langkah:

1. **Profil Lembaga:** nama, bentuk organisasi, sektor, deskripsi, dan website.
2. **Alamat & PIC:** alamat, provinsi/kota, serta nama, jabatan, telepon, dan email PIC.
3. **Dokumen & Tujuan:** alasan dan tujuan kemitraan, target dampak, kontribusi, periode, serta daftar dokumen pendukung.
4. **Review & Submit:** meninjau isian dan mengirim atau mengirim ulang pengajuan.

Mitra dapat menyimpan draf, meninjau status kemitraan, serta membaca catatan Admin PSA ketika pengajuan memerlukan revisi.

Dokumen diunggah ke bucket privat Supabase Storage, metadata ditautkan ke organisasi, dan tautan baca memiliki masa berlaku singkat. Dokumen yang sudah diverifikasi tidak dapat dihapus oleh mitra.

### 7. Pengaturan Akun

- Mengubah kata sandi dengan memasukkan kata sandi lama, kata sandi baru (minimal 8 karakter), dan konfirmasi kata sandi.
- Meminta tautan reset kata sandi ke email akun melalui layanan Supabase.
- Menampilkan pesan berhasil atau kesalahan dari proses perubahan/reset.

## Catatan implementasi dan penggunaan

- Navigasi portal menampilkan halaman sesuai role mitra; URL portal juga dapat digunakan untuk membuka halaman langsung setelah sesi dan role tervalidasi.
- Fitur proposal dan review hanya dapat digunakan apabila sesi mitra dan organisasi sudah tertaut dengan benar.
- Status pelaksanaan, pengumuman dan laporan memerlukan migrasi `20261019000001_program_execution_reports.sql` telah diterapkan pada Supabase.
- Tanggal atau kuota yang sudah kedaluwarsa/penuh menutup pendaftaran; keputusan admin tetap diperlukan untuk publikasi dan persetujuan laporan.

## Referensi implementasi

- Rute dan renderer halaman: [`app/page.tsx`](../app/page.tsx)
- Menu dan workspace: [`PortalLayout.tsx`](../src/components/layout/PortalLayout.tsx)
- Dashboard: [`PartnerDashboard.tsx`](../src/components/partner/PartnerDashboard.tsx)
- Program: [`PartnerProgramsList.tsx`](../src/components/partner/PartnerProgramsList.tsx)
- Formulir proposal: [`CreateProposalModal.tsx`](../src/components/partner/CreateProposalModal.tsx)
- Peserta: [`PartnerParticipantsList.tsx`](../src/components/partner/PartnerParticipantsList.tsx)
- Analitik: [`PartnerAnalyticsView.tsx`](../src/components/partner/PartnerAnalyticsView.tsx)
- Profil organisasi: [`PartnerOrganizationForm.tsx`](../src/components/partner/PartnerOrganizationForm.tsx)
- Pengaturan akun: [`PartnerAccountSettings.tsx`](../src/components/partner/PartnerAccountSettings.tsx)
- Endpoint program mitra: [`route.ts`](../app/api/partner/programs/route.ts)
