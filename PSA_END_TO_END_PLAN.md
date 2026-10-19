# PSA --- Rencana Penyelesaian Website Kemitraan dan Relawan

## 1. Tujuan Produk

Website PSA adalah sistem untuk **mengelola mitra dan menerima relawan
bagi program yang dibuat oleh mitra PSA**. Fokus utama bukan membangun
banyak modul administratif, melainkan memastikan alur berikut berjalan
utuh:

1.  Organisasi mengajukan kemitraan dengan PSA.
2.  Admin memeriksa dan menyetujui kemitraan.
3.  Mitra yang disetujui memperoleh akses ke dashboard mitra.
4.  Mitra membuat dan mengajukan program kolaborasi.
5.  Admin meninjau program dan menentukan apakah program boleh
    dipublikasikan.
6.  Masyarakat melihat program yang tersedia dan mendaftar sebagai
    relawan tanpa membuat akun.
7.  Admin dan mitra mengelola pendaftar sesuai tanggung jawab
    masing-masing.
8.  Peserta menerima konfirmasi dan informasi hasil seleksi melalui
    email.
9.  Status pelaksanaan program diperbarui agar publik mengetahui tahap
    program.
10. Setelah kegiatan, mitra melengkapi laporan dan Admin dapat memantau
    hasil seluruh program.

**Prioritas utama:** pengelolaan mitra, program kolaborasi, pendaftaran
relawan, seleksi, dan status pelaksanaan program. Fitur lain hanya
dibuat jika mendukung alur utama tersebut.

## 2. Kondisi Project Saat Ini

Project sudah memiliki halaman dan komponen berikut menurut dokumentasi
yang tersedia. Audit kode aktual sebelum mengubahnya.

### Portal Mitra

-   `/mitra/dashboard`
-   `/mitra/program`
-   `/mitra/relawan`
-   `/mitra/analitik`
-   `/mitra/organisasi`
-   `/mitra/pengaturan-akun`

Komponen yang disebut dalam dokumentasi: - `PartnerDashboard.tsx` -
`PartnerProgramsList.tsx` - `CreateProposalModal.tsx` -
`PartnerParticipantsList.tsx` - `PartnerAnalyticsView.tsx` -
`PartnerOrganizationForm.tsx` - `PartnerAccountSettings.tsx`

### Portal Admin

-   `/admin/overview`
-   `/admin/dashboard`
-   `/admin/verifikasi-mitra`
-   `/admin/program`
-   `/admin/seleksi-relawan`
-   `/admin/analitik`
-   `/admin/users-activity`
-   `/admin/email-followups`

### Masalah yang sudah terindikasi

-   Sebagian widget dashboard berisi data contoh, bukan data database.
-   Kontrol dokumen pada profil organisasi belum menjadi alur unggah
    berkas produksi.
-   Ada potensi dua tempat untuk mengelola seleksi relawan: tab pada
    halaman Mitra Admin dan halaman Peserta.
-   Status proposal, publikasi, pelaksanaan program, dan status aplikasi
    relawan berpotensi tercampur.
-   Alur auth, penautan akun ke organisasi, pembatasan akses mitra, dan
    email perlu diverifikasi dari kode serta kebijakan Supabase yang
    aktual.

Jangan menganggap semua temuan ini pasti masih ada. Audit dan tandai
setiap fitur sebagai `berfungsi`, `parsial`, `mock`, `rusak`, atau
`belum ada`.

## 3. Peran dan Batas Tanggung Jawab

### 3.1 Publik / calon relawan

Tidak perlu membuat akun pada tahap ini. Publik dapat: - Melihat program
yang sudah dipublikasikan. - Melihat persyaratan, lokasi, jadwal, kuota
bila ditampilkan, tahap program, dan pengumuman umum. - Mendaftar ke
program yang sedang menerima pendaftaran. - Menerima email konfirmasi
pendaftaran. - Menerima hasil seleksi pribadi melalui email.

Publik tidak dapat melihat daftar pendaftar, data pribadi peserta,
catatan seleksi, dokumen internal, atau keputusan individual milik orang
lain.

### 3.2 Admin PSA

Admin adalah pengelola pusat dan bertanggung jawab atas kualitas serta
tata kelola sistem. Admin dapat: - Melihat semua pengajuan mitra,
seluruh program, dan semua pendaftaran relawan. - Memeriksa dan
menyetujui, meminta revisi, atau menolak pengajuan kemitraan. -
Membuat/menautkan akun mitra setelah pengajuan disetujui. - Memeriksa
proposal program dan menyetujui sebelum program dipublikasikan. -
Melihat semua aplikasi relawan, memfilter berdasarkan
program/mitra/status, dan memeriksa detail yang diperlukan. - Mengawasi
seleksi dan memfinalisasi keputusan bila kebijakan PSA
mensyaratkannya. - Mengelola status program, perubahan penting,
pembatalan, dan pengumuman publik. - Memastikan email peserta dan mitra
dikirim pada tahap yang benar. - Melihat dokumen dan laporan program
dari seluruh mitra. - Memantau statistik global dan riwayat tindakan
penting.

Admin tidak boleh mengubah status tanpa validasi atau membuat tindakan
penting yang tidak meninggalkan riwayat.

### 3.3 Mitra

Setiap akun mitra harus ditautkan ke organisasi yang benar. Mitra
dapat: - Melihat dan memperbarui profil organisasinya sesuai status dan
izin. - Mengirim dokumen dan menindaklanjuti permintaan revisi. -
Membuat, menyimpan, dan mengajukan proposal program. - Melihat status
review dan catatan dari Admin. - Melihat serta mengelola pendaftar hanya
dari program yang dimiliki organisasinya. - Memeriksa pendaftar dan
memberikan rekomendasi seleksi atau keputusan sesuai kewenangan yang
ditetapkan PSA. - Mengusulkan perubahan jadwal/status bila perlu
persetujuan Admin. - Mengirim laporan dan dokumentasi program
miliknya. - Melihat statistik pendaftar dan hasil program miliknya.

Mitra tidak dapat menyetujui proposalnya sendiri untuk publikasi,
melihat data mitra lain, mengubah role akun, atau mengakses data di luar
organisasinya.

### 3.4 Kebijakan seleksi yang direkomendasikan

Gunakan satu alur seleksi yang sama untuk semua program: - Mitra
melakukan review awal dan memberikan rekomendasi karena mitra memahami
kebutuhan program. - Admin memiliki visibilitas atas semua keputusan dan
dapat memfinalisasi hasil sesuai kebijakan PSA. - Keputusan final dan
pengiriman email hasil seleksi harus jelas siapa yang berwenang
memicunya. - Jangan membuat dua sistem aplikasi relawan yang terpisah
antara halaman Mitra dan Admin.

Jika PSA memutuskan bahwa mitra boleh menetapkan hasil final sendiri,
jadikan itu aturan permission yang eksplisit. Jangan biarkan kewenangan
final berbeda secara tidak sengaja antarhalaman.

## 4. Alur Kerja End-to-End

### 4.1 Pengajuan dan persetujuan mitra

1.  Calon mitra mengisi formulir publik tanpa login.
2.  Sistem memvalidasi data, menyimpan pengajuan, dan menampilkan
    konfirmasi.
3.  Admin melihat pengajuan di antrean review, memeriksa profil serta
    dokumen, lalu memilih:
    -   `Perlu Revisi`: simpan catatan yang harus diperbaiki dan beri
        tahu calon mitra melalui email.
    -   `Ditolak`: simpan alasan dan kirim pemberitahuan.
    -   `Disetujui`: ubah status organisasi dan lanjutkan
        pembuatan/penautan akun.
4.  Pembuatan akun harus aman dan idempotent: pengulangan aksi tidak
    boleh membuat akun atau organisasi ganda.
5.  Kirim instruksi akses melalui email. Utamakan invite atau tautan
    untuk menetapkan kata sandi sendiri; hindari kata sandi sementara
    yang mudah ditebak.
6.  Mitra masuk dan hanya melihat organisasi yang sudah ditautkan ke
    akunnya.

Pengajuan online dan input mitra offline oleh Admin harus masuk ke
proses review dan model data yang sama. Bedanya hanya sumber data awal.

### 4.2 Auth dan penautan akun

-   Gunakan Supabase Auth untuk autentikasi.
-   Simpan role aplikasi dan hubungan akun-organisasi dalam data yang
    tervalidasi di server/database.
-   Role minimal: `admin` dan `partner`. Relawan tidak memerlukan akun
    pada MVP.
-   Jangan percaya pada role atau `organization_id` yang dikirim dari
    browser; server harus memeriksa sesi dan hubungan akun-organisasi.
-   Akun mitra baru hanya dibuat/diaktifkan setelah persetujuan Admin.
-   Tangani email yang sudah memiliki akun: tautkan akun yang sah atau
    tampilkan proses penyelesaian yang aman; jangan membuat akun
    duplikat atau menimpa akun lain.
-   Sediakan perubahan kata sandi dan reset melalui alur Supabase yang
    aman.
-   Jangan menyimpan kata sandi plaintext atau menaruh service-role key
    di sisi client.
-   Jika akun dicabut/nonaktif, akses ke data organisasi juga harus
    dicabut.

### 4.3 Pengajuan dan persetujuan program

1.  Mitra yang sudah disetujui membuat draft program.
2.  Mitra mengisi minimal: judul, kategori, ringkasan, deskripsi/tujuan,
    format kegiatan, lokasi, jadwal, deadline pendaftaran, kuota bila
    digunakan, persyaratan relawan, aksesibilitas, PIC, dan media.
3.  Mitra menyimpan draft atau mengajukan proposal.
4.  Admin memeriksa kelengkapan, kelayakan, tanggal, kuota, dan
    informasi publik.
5.  Admin menyetujui, meminta revisi dengan catatan, atau menolak.
6.  Program yang menunggu review/revisi/ditolak tidak boleh tampil
    sebagai program terbuka untuk pendaftaran.
7.  Setelah disetujui, program dapat dipublikasikan jika informasi wajib
    sudah lengkap dan aturan publikasi terpenuhi.
8.  Perubahan penting setelah publikasi---misalnya tanggal, lokasi,
    kuota, persyaratan, atau pembatalan---harus dicatat dan dapat
    memerlukan persetujuan Admin.
9.  Semua perubahan status dan data penting memiliki riwayat.

### 4.4 Pendaftaran relawan

1.  Publik membuka halaman program yang sudah dipublikasikan.
2.  Tombol daftar aktif hanya jika pendaftaran dibuka, belum melewati
    deadline, dan kuota/aturan pendaftaran mengizinkan.
3.  Form mengumpulkan data minimum yang dibutuhkan untuk seleksi:
    identitas dan kontak, domisili yang relevan, motivasi, jawaban
    persyaratan, serta gender hanya jika benar-benar diperlukan dan
    opsional bila sesuai kebijakan.
4.  Sistem menghubungkan aplikasi dengan `program_id` yang valid; client
    tidak boleh menentukan status seleksi.
5.  Cegah aplikasi ganda untuk orang/program yang sama berdasarkan
    aturan yang ditetapkan, misalnya email yang dinormalisasi + program.
6.  Simpan aplikasi, tampilkan konfirmasi, dan kirim email penerimaan
    pendaftaran.
7.  Kegagalan email tidak boleh menghapus aplikasi yang sudah tersimpan;
    sediakan status pengiriman dan mekanisme retry.
8.  Peserta tidak perlu login dan tidak dapat mengakses dashboard
    peserta pada MVP.

### 4.5 Review dan seleksi relawan

-   Semua aplikasi disimpan pada satu sumber data.
-   Admin melihat aplikasi dari semua program.
-   Mitra hanya melihat aplikasi program milik organisasinya.
-   Halaman peserta mendukung pencarian, filter program/status,
    pagination, detail aplikasi, catatan, dan ekspor yang sesuai izin.
-   Status aplikasi minimal: `submitted`, `under_review`, `waitlisted`,
    `accepted`, `rejected`, `withdrawn`.
-   Status hanya dapat diubah oleh role yang berwenang dan melalui
    transisi yang valid.
-   Catat aktor, waktu, status lama/baru, dan catatan keputusan.
-   Jika hasil final perlu persetujuan Admin, keputusan mitra harus
    ditandai sebagai rekomendasi dan tidak langsung memicu email hasil
    final.
-   Setelah hasil final disahkan, kirim email personal kepada peserta
    yang relevan.
-   Jangan tampilkan nama atau hasil seleksi individual pada halaman
    publik.
-   Ekspor CSV harus mengikuti filter dan hanya menyertakan kolom yang
    dibutuhkan.

### 4.6 Pelaksanaan dan status publik program

Pisahkan tiga status berikut: 1. **Status kemitraan** --- proses
kelayakan organisasi. 2. **Status persetujuan program** --- draft,
review, revisi, disetujui, ditolak. 3. **Status pelaksanaan program**
--- tahap operasional yang dapat ditampilkan kepada publik.

Status pelaksanaan yang disarankan: - Segera Dibuka - Pendaftaran
Dibuka - Pendaftaran Ditutup - Seleksi Peserta - Pengumuman Peserta -
Persiapan Kegiatan - Sedang Berlangsung - Selesai - Dibatalkan

Gunakan label dan aturan transisi yang konsisten. Status publik tidak
boleh menggantikan status aplikasi individual. Jangan otomatis menandai
program selesai hanya karena tanggal berakhir; minta konfirmasi
penyelesaian atau tampilkan tugas yang perlu ditinjau.

Halaman publik program menampilkan tahap saat ini, tanggal penting,
instruksi umum, dan pengumuman. Jangan tampilkan catatan internal,
daftar peserta, atau hasil individual.

### 4.7 Penyelesaian program

1.  Mitra mengunggah laporan dan dokumentasi yang diwajibkan.
2.  Admin meninjau kelengkapan dan meminta revisi bila diperlukan.
3.  Program ditandai selesai setelah syarat penyelesaian dipenuhi dan
    dikonfirmasi oleh pihak yang berwenang.
4.  Statistik program tetap tersedia untuk pelaporan internal.
5.  Riwayat program dan dokumen disimpan sesuai kebijakan retensi PSA.

## 5. Navigasi dan Tanggung Jawab Halaman

### Admin

-   **Overview:** metrik nyata seluruh platform dan antrean penting.
-   **Dashboard:** pekerjaan yang perlu ditindaklanjuti, bukan angka
    dekoratif.
-   **Manajemen Mitra:** pengajuan, review, dokumen, status, akun, dan
    riwayat organisasi.
-   **Manajemen Program:** semua program, filter status/mitra, review
    proposal, status pelaksanaan, dan akses ke detail program.
-   **Manajemen Peserta:** semua aplikasi dari seluruh program, filter
    global, detail, keputusan, email hasil, dan ekspor.
-   **Email Follow-up:** template, penerima, pratinjau, konfirmasi
    pengiriman, log dan kegagalan.
-   **Analitik:** ringkasan global yang berasal dari database.
-   **Users & Activity:** akun/role, notifikasi operasional yang nyata,
    dan audit log.

Jangan menjadikan tab "Seleksi Relawan" di Manajemen Mitra sebagai
sumber data peserta yang terpisah. Bila tab tersebut tetap diperlukan
untuk alasan UI, ia harus menggunakan service dan data aplikasi yang
sama dengan Manajemen Peserta.

### Mitra

-   **Dashboard:** status organisasi, program miliknya, pendaftar, dan
    tindakan yang perlu diselesaikan.
-   **Program Kolaborasi:** draft, pengajuan, status review, dan daftar
    program milik organisasi.
-   **Data Relawan:** aplikasi dari program milik organisasi, dengan
    filter program/status.
-   **Analitik Program:** agregat pendaftar, penerimaan, kuota, gender
    jika tersedia, dan wilayah yang diketahui.
-   **Profil Organisasi:** informasi organisasi, PIC, dokumen, dan
    catatan review.
-   **Pengaturan Akun:** ubah kata sandi dan reset melalui Supabase.

### Satu Detail Program untuk semua jalur

Admin dan Mitra menggunakan halaman detail program yang sama dengan
tab: - `Overview`: informasi, jadwal, kuota, status, timeline. -
`Peserta`: aplikasi yang terlihat sesuai izin. - `Dokumen`: proposal dan
dokumen program. - `Laporan`: laporan dan dokumentasi kegiatan. -
`Aktivitas`: riwayat status dan perubahan.

Dari halaman Mitra, klik program harus membuka detail program milik
organisasi tersebut. Dari halaman Admin atau Peserta, klik program harus
membuka detail program yang sama. Perbedaan hanya pada data yang dapat
diakses dan tindakan yang diizinkan.

## 6. Model Data dan Keamanan

Audit skema existing terlebih dahulu dan gunakan kembali tabel yang
benar. Jangan membuat tabel baru jika kebutuhan sudah ditangani oleh
tabel yang valid.

Relasi minimum yang harus terjamin: - Akun mitra terhubung ke
organisasi. - Program terhubung ke satu organisasi pemilik. - Aplikasi
relawan terhubung ke satu program. - Dokumen/laporan terhubung ke
organisasi atau program yang tepat. - Riwayat status terkait ke entitas
yang berubah dan aktor yang melakukan perubahan.

Tabel yang mungkin dibutuhkan jika belum ada: - profil/role akun -
organisasi dan pengajuan organisasi - program - aplikasi relawan -
metadata dokumen - pengumuman program - laporan program - riwayat
status/audit - log email

Aturan keamanan: - Terapkan RLS pada tabel yang berisi data aplikasi. -
Admin memiliki akses global sesuai perannya. - Mitra hanya dapat
membaca/mengubah data organisasi dan program yang tertaut pada
akunnya. - Publik hanya dapat membaca program yang dipublikasikan dan
field publik yang aman. - Endpoint publik hanya boleh membuat aplikasi
yang valid; endpoint tidak boleh mengungkap data aplikasi lain. - File
legal dan dokumen internal disimpan di bucket privat dengan otorisasi
atau signed URL terbatas. - Validasi input, ukuran dan jenis file,
foreign key, tanggal, kuota, dan transisi status di server. - Jangan
mengandalkan penyembunyian tombol sebagai pengamanan. - Jangan mencatat
kata sandi, token, atau rahasia di log.

## 7. Data Nyata, Email, dan Analitik

### Data nyata

Hapus data contoh yang terlihat seperti metrik operasional. Setiap
statistik harus memiliki definisi: - jumlah program bukan jumlah
proposal yang belum disetujui; - jumlah aplikasi tidak sama dengan
jumlah orang unik; - jumlah diterima dihitung berdasarkan status
aplikasi yang final; - statistik mitra hanya menghitung program dan
aplikasi milik mitra itu.

Jika belum ada data, tampilkan keadaan kosong atau `0` dengan jelas.
Jangan membuat angka, agenda, deadline, atau notifikasi palsu.

### Email

Email digunakan untuk: - konfirmasi pengajuan mitra; - permintaan
revisi/keputusan kemitraan; - instruksi akses akun mitra; - konfirmasi
pendaftaran relawan; - permintaan revisi proposal; - perubahan penting
jadwal atau pembatalan program; - hasil seleksi individual; - pengingat
laporan atau tahap program jika dibutuhkan.

Email hanya dipicu setelah perubahan database berhasil. Simpan penerima,
jenis email, waktu, status, dan error yang relevan. Hindari pengiriman
ganda. Gunakan provider email yang sudah tersedia atau dipilih untuk
project dan konfigurasi server yang aman.

### Analitik

-   Admin melihat statistik seluruh program.
-   Mitra melihat statistik program miliknya.
-   Distribusi gender hanya dihitung dari data yang diberikan dan layak
    digunakan; jangan menebak dari nama/foto.
-   Kota/provinsi yang tidak diketahui harus ditampilkan sebagai tidak
    diketahui.
-   Ekspor mengikuti izin dan filter aktif.

## 8. Tahapan Pengerjaan

Kerjakan berurutan. Selesaikan dan uji tiap tahap sebelum masuk tahap
berikutnya.

### Tahap 1 --- Audit project saat ini

-   Petakan halaman, komponen, endpoint, schema, RLS, Storage, dan
    provider email yang benar-benar digunakan.
-   Tandai fitur sebagai berfungsi, parsial, mock, rusak, atau belum
    ada.
-   Cari duplikasi alur peserta, hardcoded data, tombol tanpa backend,
    dan ketidaksesuaian status.
-   Jalankan lint, typecheck, test, dan build yang tersedia.
-   Buat daftar perubahan minimum berdasarkan dependensi.

**Selesai jika:** kondisi aktual project jelas dan tidak ada asumsi
tentang fitur yang belum diperiksa.

### Tahap 2 --- Benahi fondasi auth, relasi, dan izin

-   Pastikan role Admin/Mitra ditentukan dan diverifikasi secara aman.
-   Pastikan setiap akun mitra terhubung ke organisasi yang benar.
-   Audit dan uji RLS serta semua API sensitif.
-   Pastikan Mitra A tidak dapat mengakses data Mitra B melalui UI
    maupun panggilan API langsung.
-   Rapikan migration tanpa merusak data yang ada.

**Selesai jika:** batas akses tervalidasi untuk Admin, Mitra A, Mitra B,
dan publik.

### Tahap 3 --- Selesaikan alur kemitraan

-   Form publik dan input offline Admin masuk ke model data/workflow
    yang sama.
-   Admin dapat review, meminta revisi, menolak, dan menyetujui.
-   Akun dibuat/ditautkan satu kali setelah persetujuan.
-   Email akses dan catatan status tercatat.
-   Mitra dapat login dan mengelola profil/dokumen dengan benar.

**Selesai jika:** alur pengajuan hingga akun mitra berjalan tanpa
pembuatan akun ganda atau akses yang salah.

### Tahap 4 --- Selesaikan alur program

-   Proposal draft, submit, review, revisi, resubmit, approval, dan
    publikasi tersambung ke database.
-   Validasi jadwal, kuota, deadline, dan field wajib.
-   Program hanya muncul untuk publik saat memenuhi syarat.
-   Detail Program menjadi satu halaman bersama untuk Admin dan Mitra.
-   Riwayat perubahan tersimpan.

**Selesai jika:** program bisa dibuat, ditinjau, diperbaiki, disetujui,
dan dipublikasikan dengan benar.

### Tahap 5 --- Selesaikan pendaftaran relawan

-   Form publik terhubung ke program yang benar.
-   Hanya program yang membuka pendaftaran yang dapat menerima aplikasi.
-   Validasi dan pencegahan duplikasi berfungsi.
-   Aplikasi tersimpan dan muncul di halaman yang tepat.
-   Konfirmasi email dan error handling berjalan.

**Selesai jika:** relawan dapat mendaftar tanpa akun dan aplikasi muncul
pada program yang sesuai.

### Tahap 6 --- Satukan seleksi dan manajemen peserta

-   Admin dapat mengelola aplikasi dari semua program.
-   Mitra hanya dapat mengelola aplikasi dari programnya.
-   Satu sumber data dan satu aturan status dipakai oleh semua halaman.
-   Detail aplikasi, catatan, filter, pagination, dan ekspor berfungsi.
-   Hasil final dan email dikirim sesuai kewenangan.
-   Tidak ada hasil seleksi pribadi yang terbuka ke publik.

**Selesai jika:** perubahan keputusan konsisten di seluruh UI dan
dibatasi oleh izin server.

### Tahap 7 --- Selesaikan status/timeline program dan laporan

-   Status pelaksanaan terpisah dari status proposal dan status
    aplikasi.
-   Timeline publik dan pengumuman hanya menampilkan informasi yang
    disetujui untuk publik.
-   Mitra mengunggah laporan/dokumentasi; Admin meninjau.
-   Program selesai setelah konfirmasi dan persyaratan penyelesaian
    terpenuhi.
-   Riwayat program dapat ditelusuri.

**Selesai jika:** peserta memahami tahap program tanpa perlu portal
akun, dan tim PSA dapat menutup program secara tertib.

### Tahap 8 --- Email, analitik, dan perapian UI

-   Email, log, retry, dan anti-duplikasi terhubung ke event nyata.
-   Statistik Admin/Mitra berasal dari database dan cocok dengan daftar
    sumber.
-   Semua data contoh operasional dihapus atau diberi label development.
-   Loading, empty state, error, success, dan konfirmasi aksi tersedia.
-   Semua tombol utama berfungsi atau dinonaktifkan dengan alasan yang
    jelas.

**Selesai jika:** UI merefleksikan kondisi backend dan tidak menyesatkan
pengguna.

### Tahap 9 --- Uji end-to-end dan persiapan rilis

Uji minimal: - pengajuan mitra online/offline, revisi, persetujuan,
login, dan penautan akun; - pengajuan proposal, review, revisi,
persetujuan, dan publikasi; - pendaftaran relawan, pencegahan duplikasi,
seleksi, email hasil, dan pembatalan; - akses Admin vs Mitra A vs Mitra
B vs publik; - dokumen privat, email gagal, data kosong, deadline, kuota
penuh, dan status tidak valid; - lint, typecheck, test, dan production
build.

Dokumentasikan environment, migrations, konfigurasi Auth/email/Storage,
dan prosedur backup/rollback.

**Selesai jika:** seluruh alur utama lulus uji, tidak ada temuan
keamanan kritis/tinggi yang terbuka, dan blocker yang tersisa dicatat.

## 9. Keputusan Produk yang Harus Dikunci

Gunakan keputusan berikut sebagai default kecuali PSA menentukan
lain: 1. Admin wajib menyetujui mitra dan proposal sebelum program
dipublikasikan. 2. Mitra hanya mengelola organisasi, program, dan
pendaftar miliknya. 3. Mitra melakukan review awal peserta; kewenangan
keputusan final ditetapkan secara eksplisit. 4. Relawan tidak membuat
akun pada MVP. 5. Hasil seleksi individual dikirim lewat email, bukan
dipublikasikan. 6. Pendaftaran ditutup ketika deadline terlewati; kuota
penuh juga dapat menutupnya jika aturan program menetapkan demikian. 7.
Perubahan penting setelah publikasi harus tercatat dan dapat memerlukan
persetujuan Admin. 8. Data yang tidak tersedia ditampilkan sebagai tidak
diketahui, bukan ditebak. 9. Program tidak otomatis dianggap selesai
hanya karena tanggal akhir lewat. 10. Pengajuan, perubahan status,
seleksi, dan pengiriman email harus dapat ditelusuri.

## 10. Definisi Selesai

Aplikasi dapat dianggap selesai untuk tujuan utama PSA ketika: - \[ \]
Mitra dapat mengajukan kemitraan dan Admin dapat memverifikasi serta
memberi akses dengan aman. - \[ \] Mitra dapat mengajukan program dan
Admin dapat meninjau serta mempublikasikannya. - \[ \] Publik dapat
melihat program aktif dan mendaftar sebagai relawan tanpa akun. - \[ \]
Admin melihat semua aplikasi; Mitra hanya aplikasi dari program
miliknya. - \[ \] Seleksi, catatan, keputusan, dan email berjalan dengan
aturan yang konsisten. - \[ \] Status/timeline program menunjukkan tahap
yang benar tanpa membuka data pribadi. - \[ \] Dokumen dan laporan
tersimpan di tempat yang benar dengan izin yang tepat. - \[ \] Dashboard
dan analitik memakai data nyata. - \[ \] RLS dan API mencegah akses
lintas organisasi. - \[ \] Alur utama lulus pengujian end-to-end dan
dokumentasi operasional tersedia.

**Urutan yang paling masuk akal dari kondisi saat ini:** audit project →
auth dan izin → workflow mitra → workflow program → pendaftaran relawan
→ seleksi peserta → timeline/laporan → email dan analitik → pengujian
rilis.

Fokuskan waktu pada alur utama tersebut. Jangan menambah modul baru
sebelum alur mitra → program → relawan → seleksi → pelaksanaan
benar-benar berjalan dari ujung ke ujung.
