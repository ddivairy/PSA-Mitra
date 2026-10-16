# Operasional Email Follow-up

## Gmail API

Fitur admin menggunakan Gmail API `users.messages.send` dengan OAuth refresh token. Tidak ada email otomatis: admin memilih template, mitra, subject, dan isi pesan lalu mengonfirmasi penerima sebelum pengiriman.

Atur environment variables berikut pada server/deployment (jangan memakai prefiks `NEXT_PUBLIC_`):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN` dengan scope `https://www.googleapis.com/auth/gmail.send`
- `GMAIL_FROM` sebagai alamat Gmail yang terhubung
- `SUPABASE_SERVICE_ROLE_KEY` untuk akses server ke penerima dan log
- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk validasi sesi

Refresh token dibuat untuk akun Google pengirim melalui OAuth consent dan OAuth client yang dikelola organisasi. Simpan nilainya di secret manager hosting atau `.env.local` yang tidak dikomit. Jangan menempelkan secret ke UI/browser. Jika variabel Gmail belum tersedia, UI menampilkan status konfigurasi belum lengkap; percobaan manual akan dicatat sebagai gagal, bukan dilaporkan terkirim. Status `sent` berarti Gmail API menerima permintaan, bukan bukti email dibaca/delivered ke inbox.

## Database dan akses

Terapkan migrasi berurutan `20261016000000_email_followup_logs.sql` dan `20261016000001_public_intake.sql`. Endpoint admin hanya menerima sesi Supabase yang valid, memverifikasi `public.users.role = 'admin'` dan claim `app_metadata.psa_role = 'admin'`. Claim admin hanya boleh dipasang administrator tepercaya. Pembacaan penerima dan riwayat, perubahan status, serta operasi storage memakai service role di server. Tabel intake dan follow-up RLS-nya aktif tanpa policy browser; bucket dokumen privat dan berkas diakses admin lewat signed URL singkat.

## Portal Relawan dan Mitra

Portal Relawan sementara dinonaktifkan, namun form pendaftaran/seleksi dan follow-up relawan tetap aktif. Untuk mengaktifkan portal kembali, atur `PORTAL_VOLUNTEER_ENABLED=true` dan `NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED=true`, lalu deploy ulang. Portal Mitra tetap aktif dan login memakai Supabase Auth; tombol login/register demo dihapus.

Pengajuan publik hanya menyimpan data dan dokumen. Akun Supabase Auth `partner` dan profil organisasi `approved` dibuat server ketika admin menyetujui pengajuan. Pembuatan account menggunakan metadata application ID dan pengecekan email Auth agar retry approval tidak membuat akun ganda; jika terjadi kegagalan di tengah proses, ulangi approval untuk menyelesaikan tautan. Rekomendasi operasional: satu akun per PIC resmi dengan email kerja organisasi yang dikelola; jangan berbagi kredensial. Jika satu organisasi butuh banyak PIC, tambahkan tabel keanggotaan/invitation yang menautkan beberapa akun ke satu profil organisasi.

Password awal sesuai permintaan dibuat dari nama organisasi yang dinormalisasi lalu tanggal pendaftaran `DDMMYYYY`. Ini hanya ditampilkan pada respons aksi admin approval dan ditandai wajib diganti saat login pertama. Pola password deterministik berisiko ditebak; batasi penyampaian kepada PIC melalui kanal terverifikasi dan rencanakan migrasi ke tautan invitation/reset sekali pakai. Pengaturan akun mitra memverifikasi sandi lama sebelum update. Reset memakai Supabase Auth email; tambahkan `https://<domain>/auth/callback` ke daftar redirect URL Supabase.

Form mitra offline memakai tabel/status/approval yang sama dan menandai `is_offline`. Follow-up admin mencakup calon mitra dan relawan. WhatsApp hanya menyiapkan link `wa.me`; log `prepared` bukan bukti pesan terkirim. Email tidak berjalan otomatis.
