# Status Implementasi PSA

Pembaruan: 16 Oktober 2026

## Status

- TypeScript: `npm.cmd run lint` sukses; script ini menjalankan `tsc --noEmit`.
- Production build: `npm.cmd run build` sukses pada 16 Oktober 2026.
- Supabase cloud: migrasi belum diterapkan. Jalankan berurutan `20261016000000_email_followup_logs.sql`, lalu `20261016000001_public_intake.sql` setelah migrasi awal dan seeding.
- Gmail: kredensial belum tersedia pada environment yang diperiksa. UI akan menandai konfigurasi belum lengkap; percobaan pengiriman manual disimpan sebagai gagal, bukan diklaim terkirim.

## Alur Akun Mitra

Pendaftar mengirim profil PIC/organisasi dan dokumen ke tabel `partnership_applications` serta bucket privat `partner-documents`. Admin yang telah terverifikasi melalui Supabase Auth dapat meminta revisi, menolak, atau menyetujui. Approval membuat/menautkan akun Auth dengan role `partner`, profil `users`, dan organisasi `partner_organizations`. Email yang telah dipakai akun lain akan ditolak kecuali akun lama terbukti telah tertaut ke organisasi yang sama. Approval menggunakan status proses dan idempotency metadata agar aman saat dicoba ulang.

Kata sandi awal mengikuti permintaan: nama organisasi yang dinormalisasi + tanggal pengajuan `DDMMYYYY`. Hanya endpoint admin mengembalikan kata sandi itu; login pertama wajib menggantinya. Karena pola ini dapat ditebak, gunakan hanya sementara dan sampaikan kepada PIC melalui kanal terverifikasi. Rekomendasi akun adalah satu akun per PIC resmi dengan email kerja organisasi, bukan akun bersama. Untuk banyak PIC, gunakan tabel keanggotaan/invitation yang menautkan akun-akun individual ke satu organisasi.

## Email dan WhatsApp

Follow-up hanya berjalan atas aksi admin. Gmail API memerlukan `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` dengan scope `gmail.send`, dan `GMAIL_FROM` sebagai rahasia server. Email `sent` berarti Gmail menerima permintaan. WhatsApp menggunakan `wa.me`; status `prepared` hanya berarti pesan siap dibuka, bukan terkirim.

Tambahkan URL redirect Supabase Auth `https://<domain>/auth/callback` untuk reset password. `SUPABASE_SERVICE_ROLE_KEY` harus disimpan server-side dan tidak boleh memakai prefix `NEXT_PUBLIC_`.
