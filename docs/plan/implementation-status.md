# Status Implementasi PSA

Pembaruan: 19 Oktober 2026

## Status

- Verifikasi lokal terbaru: `npm.cmd test`, `npm.cmd run lint`, dan `npm.cmd run build` berhasil. Unit test saat ini memeriksa validasi signature file; belum ada pengujian end-to-end alur Supabase.
- Supabase cloud: status migrasi belum diverifikasi. Terapkan hanya file skema yang belum berjalan sesuai urutan; `20261015000001_seed_initial_data.sql` berisi fixture contoh dan hanya untuk development kosong. Panduan lengkap: `docs/plan/PSA_SUPABASE_MIGRATION_GUIDE.md`. Validasi lokal tanpa seed dicoba, tetapi `initdb` diblokir pembatasan token Windows dan direktori sementara sudah dibersihkan.
- Gmail: konfigurasi tidak dikirim atau diuji dari environment ini. UI admin memeriksa variabel server-side saat mengirim; aplikasi publik menyimpan aplikasi walau email konfirmasi gagal dan mencatat status upaya.
- Audit lengkap dan gap tersisa: `docs/plan/PSA_END_TO_END_AUDIT.md`.

## Alur Akun Mitra

Pendaftar mengirim profil PIC/organisasi dan dokumen ke tabel `partnership_applications` serta bucket privat `partner-documents`. Admin yang telah terverifikasi melalui Supabase Auth dapat meminta revisi, menolak, atau menyetujui. Approval membuat/menautkan akun Auth dengan role `partner`, profil `users`, dan organisasi `partner_organizations`. Email yang telah dipakai akun lain akan ditolak kecuali akun lama terbukti telah tertaut ke organisasi yang sama. Approval menggunakan status proses dan idempotency metadata agar aman saat dicoba ulang.

Kata sandi awal mengikuti permintaan: nama organisasi yang dinormalisasi + tanggal pengajuan `DDMMYYYY`. Hanya endpoint admin mengembalikan kata sandi itu; login pertama wajib menggantinya. Karena pola ini dapat ditebak, gunakan hanya sementara dan sampaikan kepada PIC melalui kanal terverifikasi. Rekomendasi akun adalah satu akun per PIC resmi dengan email kerja organisasi, bukan akun bersama. Untuk banyak PIC, gunakan tabel keanggotaan/invitation yang menautkan akun-akun individual ke satu organisasi.

## Email dan WhatsApp

Follow-up hanya berjalan atas aksi admin. Gmail API memerlukan `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` dengan scope `gmail.send`, dan `GMAIL_FROM` sebagai rahasia server. Email `sent` berarti Gmail menerima permintaan. WhatsApp menggunakan `wa.me`; status `prepared` hanya berarti pesan siap dibuka, bukan terkirim.

Tambahkan URL redirect Supabase Auth `https://<domain>/auth/callback` untuk reset password. `SUPABASE_SERVICE_ROLE_KEY` harus disimpan server-side dan tidak boleh memakai prefix `NEXT_PUBLIC_`.

## Perubahan alur program dan pendaftar

Katalog publik dan workspace admin/mitra sekarang mengambil data dari API server Supabase; `AppContext` tidak lagi memulihkan data operasional dari `localStorage` atau array demo. Kontrol simulasi role/reset lokal dihapus; akses URL pada renderer legacy memverifikasi role dari sesi Supabase. Mitra dapat menyimpan/mengedit proposal draf dan mengirim ulang proposal revisi melalui endpoint scoped; approval proposal terpisah dari publikasi. Pendaftaran relawan publik tanpa akun disimpan pada `volunteer_applications` melalui RPC transaksional yang mengecek program, deadline, kuota, tahap pendaftaran, dan duplikasi. Mitra memberi rekomendasi seleksi melalui endpoint yang membatasi aplikasi ke program organisasinya; keputusan final tetap pada admin.

Mitra memperbarui profil melalui endpoint yang memvalidasi kolom, dan mengunggah/menghapus dokumen pada bucket privat dengan signed URL singkat. Pengiriman ulang revisi memperbarui status organisasi, aplikasi kemitraan, dan audit dalam satu RPC transaksional.

Admin dapat memutuskan hasil seleksi relawan dari endpoint terproteksi. Keputusan accepted/waitlisted/rejected mencoba mengirim email Gmail dan menyimpan status sent/failed pada `follow_up_logs`; pengiriman tidak dilakukan tanpa aksi admin. Keputusan final belum digabung secara transaksional dengan provider Gmail dan log membutuhkan tata cara retry manual.

Halaman seleksi admin mendukung filter program/status/pencarian, detail jawaban dan riwayat, rekomendasi mitra, pagination 20 data, serta ekspor CSV sesuai kelompok yang sedang dibuka. Kontrol keputusan mengikuti status transisi yang diizinkan server; modal tetap terbuka bila penyimpanan gagal.

Status pelaksanaan program, pengumuman publik, riwayat status, unggah laporan privat, review laporan, konfirmasi selesai, unggah gambar sampul, serta halaman publik `/program/[id]` dan katalog `/program` telah ditambahkan di kode serta migrasi lokal. Langkah ini baru selesai setelah migrasi `20261019000000_public_program_applications.sql`, `20261019000001_program_execution_reports.sql`, dan `20261019000002_partner_program_media.sql` diterapkan pada proyek Supabase dan alur diuji terhadap data/akun nyata. Halaman detail yang sama untuk alur kerja admin/mitra, pengingat dan retry email yang lebih terpadu, serta uji akses antarmitra masih menjadi pekerjaan berikutnya.
