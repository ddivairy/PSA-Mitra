# Panduan PSA Admin

Dokumen ini menjelaskan halaman dan fungsi yang tersedia untuk peran Admin PSA pada aplikasi saat ini. Rute portal dikelola dari [`app/page.tsx`](../app/page.tsx), dengan navigasi workspace di [`PortalLayout.tsx`](../src/components/layout/PortalLayout.tsx).

## Ringkasan navigasi

| Halaman | Rute | Fungsi utama |
|---|---|---|
| Overview | `/admin/overview` | Statistik platform dan tren tahunan |
| Dashboard | `/admin/dashboard` | Antrean tugas, progres, dan pintasan kerja admin |
| Mitra | `/admin/verifikasi-mitra` | Review kemitraan, seleksi registrasi relawan, dan akun mitra |
| Program | `/admin/program` | Review proposal, progres program, dan daftar peserta per program |
| Peserta | `/admin/seleksi-relawan` | Pencarian, filter, ekspor, dan keputusan aplikasi relawan |
| Analytics | `/admin/analitik` | Analitik wilayah, gender, performa mitra/program, dan ekspor CSV |
| Users & Activity | `/admin/users-activity` | Akun dan role, notifikasi, serta audit log |
| Email Follow-up | `/admin/email-followups` | Menyiapkan follow-up email atau WhatsApp dan melihat riwayatnya |

Overview, Mitra, Program, Peserta, Analytics, dan Email Follow-up tercantum pada navigasi admin. Dashboard dan Users & Activity juga dapat dibuka lewat pintasan di workspace atau URL masing-masing.

## Halaman dan fitur

### 1. Overview

Menampilkan empat kartu statistik:

- Jumlah mitra dan jumlah mitra yang sudah disetujui.
- Jumlah program dan jumlah program yang sudah dipublikasikan.
- Jumlah peserta unik dan jumlah aplikasi berstatus diterima.
- Jumlah pendaftaran dan yang masih menunggu keputusan.

Bagian **Tren Tahunan** menampilkan jumlah mitra baru, program baru, atau pendaftaran relawan per tahun untuk rentang lima tahun terakhir. Admin dapat memilih jenis data dan membandingkan tahun berjalan dengan tahun sebelumnya. Sumber metrik mengikuti data yang tersedia pada workspace aplikasi.

### 2. Dashboard

Dashboard menjadi pintasan pemantauan operasional:

- Memperlihatkan daftar tugas prioritas untuk review kemitraan, proposal, dan pendaftaran.
- Menampilkan progres verifikasi, seleksi, dan persetujuan proposal.
- Menampilkan antrean mitra terbaru dan tautan menuju pengelolaan mitra.
- Menyediakan pintasan ke Analytics dan Users & Activity/Audit Trail.
- Memuat ringkasan notifikasi admin dan tanggal program terbit yang akan datang.

**Catatan data:** jumlah antrean, rasio, notifikasi, dan jadwal diturunkan dari data workspace. Rasio adalah ringkasan proporsi data saat ini, bukan target SLA.

### 3. Mitra — review dan registrasi

Halaman ini memiliki tiga tab:

#### Pengajuan Mitra

- Menampilkan ringkasan pengajuan menunggu verifikasi, disetujui, dan ditolak.
- Memfilter daftar berdasarkan kelompok status dan mencari organisasi, sektor, PIC, email PIC, atau kota.
- Meninjau profil organisasi, PIC, status akun, catatan review sebelumnya, serta dokumen pendukung yang tersedia.
- Memberi keputusan **Tandai ditinjau**, **Minta revisi**, **Tolak**, atau **Setujui & buat akun**. Catatan dapat diberikan pada tindakan review; catatan revisi/penolakan menjadi informasi tindak lanjut untuk mitra.
- Menambahkan pengajuan mitra offline melalui formulir, termasuk data organisasi dan dokumen pendukung.
- Menampilkan kata sandi sementara saat akun dibuat. Admin perlu menyalin dan menyampaikannya melalui kanal yang aman saat kredensial tersebut ditampilkan.

Keputusan review dan pengajuan offline menggunakan endpoint admin dan memperbarui workspace setelah berhasil.

#### Seleksi Relawan

- Melihat registrasi relawan yang berisi nama, kontak, domisili, motivasi, dan status.
- Menambahkan catatan seleksi.
- Memberi status **Tinjau**, **Minta informasi**, **Pilih**, atau **Tolak**.
- Memperbarui daftar setelah hasil seleksi disimpan.

Tab ini memuat registrasi relawan yang dikelola melalui jalur intake admin. Pengelolaan aplikasi yang dikirim ke program tersedia terpisah pada halaman **Peserta**.

#### Akun Mitra Disetujui

- Melihat organisasi yang sudah lolos persetujuan.
- Membuat atau menautkan akun portal mitra.
- Menampilkan kata sandi sementara saat akun baru dibuat; jika akun sudah tersedia, akun tersebut tetap ditautkan dan tidak dibuat ulang.

### 4. Program

Halaman program menggabungkan antrean proposal dan pemantauan seluruh program:

- Ringkasan proposal menunggu review, proposal disetujui, program dipublikasikan, dan total pendaftaran.
- Antrean proposal dengan tindakan **Setujui proposal**, **Minta revisi**, dan **Tolak**. Catatan wajib dimasukkan untuk revisi atau penolakan.
- Mengatur publikasi secara terpisah setelah proposal disetujui.
- Tampilan progres kuota yang responsif: kartu pada layar kecil dan tabel pada layar lebar.
- Informasi periode, jumlah pendaftar terhadap target, persentase progres, status proposal, dan status publikasi.
- Membuka daftar peserta pada masing-masing program. Daftar menampilkan nama, email, domisili, dan status aplikasi; program tanpa peserta menampilkan keadaan kosong.
- Meninjau laporan program, meminta revisi atau menyetujuinya, dan mengonfirmasi penyelesaian setelah ada laporan disetujui serta tidak ada laporan tertunda.

Keputusan proposal dikirim melalui operasi admin dan workspace dimuat ulang setelah berhasil.

### 5. Peserta

Halaman ini membantu admin mengelola aplikasi relawan ke program:

- Meringkas total aplikasi dan jumlah relawan unik.
- Mencari berdasarkan nama, email, program, atau kota.
- Memfilter berdasarkan program dan status.
- Mengelompokkan peserta menjadi belum diterima, diterima, dan ditolak.
- Mengekspor hasil yang sesuai filter ke CSV.
- Membuka detail aplikasi untuk melihat kontak, program, domisili, gender, motivasi, jawaban tambahan, dan catatan keputusan.
- Memberi keputusan diterima, daftar tunggu, atau ditolak dengan catatan keputusan.

Perubahan status aplikasi disimpan melalui endpoint admin untuk aplikasi relawan.

### 6. Analytics

Tersedia tiga bagian analitik:

- **Sebaran Wilayah & Kota:** distribusi pendaftar berdasarkan provinsi dan kota/kabupaten. Data provinsi lama yang kosong dapat diperkirakan dari daftar kota yang dikenal; data yang tidak dapat dikenali masuk ke kelompok provinsi tidak diketahui.
- **Distribusi Gender & Demografi:** ringkasan agregat jumlah dan persentase gender. Data ditampilkan sebagai statistik dan tidak disimpulkan dari nama atau foto.
- **Performa Mitra & Program:** membuka ringkasan tiap mitra, jumlah program dan aplikasi, jumlah peserta diterima, serta progres kuota per program.

Admin dapat mengunduh laporan CSV yang berisi ringkasan mitra, program, gender, serta sebaran lokasi.

### 7. Users & Activity

Halaman ini mencakup tiga area:

- **Pengguna & role:** ringkasan jumlah akun per role, pencarian nama/email/role, status verifikasi email, dan daftar akun.
- **Hak akses per role:** ringkasan cakupan akses relawan, mitra, dan admin. Halaman ini menjelaskan akses; pengelolaan role per akun belum tersedia di sini.
- **Notifikasi:** menampilkan notifikasi, memfilter notifikasi yang belum dibaca, serta menandai notifikasi milik admin yang sedang masuk sebagai dibaca.
- **Audit log:** mencari aktivitas berdasarkan aktor, aksi, detail, atau jenis entitas dan melihat waktu, aktor, role, aksi, serta entitas yang terdampak.

### 8. Email Follow-up

- Memilih penerima dari pengajuan mitra, registrasi relawan, atau aplikasi program.
- Menggunakan template pembaruan status, permintaan revisi, persetujuan, pengingat program, atau hasil seleksi.
- Mengedit subjek dan isi pesan; placeholder nama PIC dan nama penerima diisi dari data penerima.
- Memilih email (Gmail) atau WhatsApp.
- Email meminta konfirmasi admin sebelum dikirim. Pengiriman memerlukan konfigurasi Gmail pada server.
- Email hasil seleksi dikirim sebagai bagian dari aksi admin yang menyimpan keputusan final; status gagal dicatat dan dapat ditindaklanjuti melalui Follow-up Email. `sent` berarti Gmail menerima permintaan, bukan bukti email telah dibaca.
- WhatsApp menyiapkan tautan `wa.me`; admin masih perlu membuka aplikasi dan mengirim pesan secara manual.
- Melihat log follow-up dan memuat ulang riwayat. Status “siap dibuka” untuk WhatsApp tidak berarti pesan sudah dikirim.

## Batasan dan catatan operasional

- Akses halaman dan tindakan admin tetap mengikuti autentikasi sesi serta otorisasi server; halaman antarmuka bukan pengganti pemeriksaan izin.
- Halaman Overview, Dashboard, dan Analytics menyajikan ringkasan berdasarkan data yang tersedia. Program tanpa kuota menampilkan target sebagai tidak dibatasi.
- Status pelaksanaan dan review laporan memerlukan migrasi `20261019000001_program_execution_reports.sql` telah diterapkan pada proyek Supabase.
- **Mitra** memuat alur kemitraan dan registrasi relawan, sedangkan **Peserta** memuat aplikasi relawan pada program. Keduanya adalah jenis data/alur yang berbeda.
- Keputusan dan perubahan yang memakai endpoint server dapat gagal bila sesi, izin, atau konfigurasi layanan tidak tersedia; periksa pesan kesalahan pada aplikasi.

## Referensi implementasi

- Rute dan renderer halaman: [`app/page.tsx`](../app/page.tsx)
- Menu dan workspace: [`PortalLayout.tsx`](../src/components/layout/PortalLayout.tsx)
- Review intake dan registrasi: [`AdminIntakeReview.tsx`](../src/components/admin/AdminIntakeReview.tsx)
- Review program dan peserta per program: [`ProgramProposalReviewList.tsx`](../src/components/admin/ProgramProposalReviewList.tsx)
- Seleksi aplikasi: [`VolunteerApplicationsManagement.tsx`](../src/components/admin/VolunteerApplicationsManagement.tsx)
- Analytics: [`GeographicGenderAnalytics.tsx`](../src/components/admin/GeographicGenderAnalytics.tsx)
- Pengguna, notifikasi, dan audit: [`AdminUsersActivity.tsx`](../src/components/admin/AdminUsersActivity.tsx)
- Follow-up: [`AdminEmailFollowups.tsx`](../src/components/admin/AdminEmailFollowups.tsx)
