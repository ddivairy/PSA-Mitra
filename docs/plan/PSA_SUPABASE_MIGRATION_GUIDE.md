# Panduan migrasi Supabase PSA

Status saat ini: migrasi baru sudah ada di repo, tetapi status migrasi cloud belum diperiksa dan tidak ada migrasi yang dijalankan dari lingkungan kerja ini.

## Peringatan data awal

`20261015000001_seed_initial_data.sql` berisi akun, organisasi, program, dan relawan statis untuk pengembangan. Jangan jalankan file seed tersebut pada database existing atau production yang tidak menghendaki fixture itu. File tersebut hanya untuk database development baru yang memang akan diisi data contoh.

Jangan menjalankan ulang baseline/seed secara membabi buta pada project yang telah memiliki tabel atau data. Periksa histori migrasi dan lakukan backup sebelum mengubah skema.

## Urutan skema

Pada database kosong yang memang disiapkan untuk PSA, jalankan melalui Supabase CLI atau SQL Editor sesuai urutan:

1. `20261015000000_initial_schema.sql`
2. `20261015000001_seed_initial_data.sql` hanya untuk development yang menghendaki fixture contoh; lewati untuk data nyata/production.
3. `20261016000000_email_followup_logs.sql`
4. `20261016000001_public_intake.sql`
5. `20261016000002_auth_user_profile_trigger.sql`
6. `20261019000000_public_program_applications.sql`
7. `20261019000001_program_execution_reports.sql`
8. `20261019000002_partner_program_media.sql`

Untuk project existing, cocokkan dahulu setiap perubahan dengan histori migrasi di project tersebut. Jalankan hanya migrasi yang belum diterapkan dan pastikan baseline telah sesuai; jangan mengulang file awal sekadar karena tidak ada CLI history lokal.

## Backup, penerapan, dan verifikasi

1. Pastikan Supabase project ref pada dashboard cocok dengan environment deployment yang sedang dituju.
2. Buat backup database atau pastikan Point-in-Time Recovery tersedia. Uji perubahan lebih dahulu pada staging yang memiliki skema representatif.
3. Terapkan file yang belum berjalan satu per satu, lalu periksa hasil setiap file sebelum melanjutkan.
4. Verifikasi objek kunci:

```sql
select to_regclass('public.volunteer_applications') as applications,
       to_regclass('public.program_status_history') as program_history,
       to_regclass('public.program_reports') as program_reports;

select proname
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in (
    'submit_public_program_application',
    'resubmit_partner_application',
    'update_partner_program_execution',
    'register_program_report',
    'finalize_program_execution',
    'is_public_program'
  )
order by proname;

select id, name, public
from storage.buckets
where id in ('partner-documents', 'program-reports', 'program-media')
order by id;

select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'published_program_directory'
  and column_name in ('pic_name', 'pic_contact', 'execution_status', 'public_announcement')
order by column_name;
```

5. Pastikan bucket dokumen (`partner-documents`, `program-reports`) tetap private, bucket `program-media` public hanya untuk gambar sampul, dan cek policy RLS untuk role admin/mitra/publik.
6. Jalankan uji akses dengan akun Admin, Mitra A, Mitra B, serta sesi tanpa login. Pastikan Mitra A tidak bisa membaca/mengubah record Mitra B.

## Rollback dan pemulihan

Perubahan ini menambah kolom, tabel, RPC, bucket, dan mengganti definisi public directory view. Jangan menghapus kolom, tabel, bucket, atau storage object secara manual sebagai rollback karena dapat menghilangkan data. Jika migrasi gagal, hentikan penerapan file berikutnya, simpan error, dan gunakan backup atau perbaikan forward-only yang ditinjau terhadap skema aktual. Pemulihan Point-in-Time dapat mengembalikan database ke waktu sebelum perubahan, tetapi harus dikoordinasikan dengan dampak data baru setelah waktu backup.

## Konfigurasi aplikasi

- Simpan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sesuai environment.
- `SUPABASE_SERVICE_ROLE_KEY` hanya tersedia di server runtime; jangan menaruhnya di variabel `NEXT_PUBLIC_*`.
- Email Gmail memerlukan `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, dan `GMAIL_FROM` di server. Tanpa variabel ini, pengiriman yang dipicu admin tercatat gagal; aplikasi tidak mengklaim email terkirim.
- Portal relawan nonaktif kecuali `NEXT_PUBLIC_PORTAL_VOLUNTEER_ENABLED=true`; mengubah flag ini tidak membuka portal mitra.
