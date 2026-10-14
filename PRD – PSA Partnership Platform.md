# Product Requirements Document (PRD): PSA Partnership Platform

**Versi:** 0.1 (Draft untuk validasi PSA) · **Status:** Draft · **Sumber:** Rancangan SDLC PSA Partnership Platform v1.0

---

## 1. Ringkasan Produk

PSA Partnership Platform adalah website kemitraan yang menghubungkan tiga kelompok pengguna: **volunteer** yang ingin berpartisipasi dalam program, **mitra (organisasi)** yang ingin berkolaborasi dengan PSA, dan **admin PSA** yang mengelola proses kemitraan, program, peserta, dan pelaporan.

Platform terdiri dari empat bagian: Public Website, Volunteer Portal, Partner Portal, dan PSA Admin Dashboard.

## 2. Latar Belakang dan Masalah

Proses kemitraan, pengajuan proposal program, dan pendaftaran volunteer perlu dikelola secara terstruktur agar:

- kebutuhan dan alur registrasi serta approval jelas;
- status pengajuan konsisten dan dapat dilacak;
- data volunteer, mitra, dan peserta terkelola aman dan terisolasi antar-pengguna;
- PSA memiliki data agregat (program, kota/provinsi, peserta) untuk evaluasi;
- setiap keputusan penting terdokumentasi (audit trail).

## 3. Tujuan dan Non-Tujuan

### 3.1 Tujuan

1. Menyediakan alur registrasi dan partisipasi volunteer yang mudah diselesaikan tanpa bantuan.
2. Menyediakan alur pengajuan kemitraan dan proposal program yang transparan (status, revisi, keputusan).
3. Memberi admin PSA alat untuk meninjau, memutuskan, dan memantau mitra, program, dan peserta.
4. Menyediakan analitik dasar program, mitra, kota, dan provinsi.
5. Menjamin keamanan akses berbasis role dan perlindungan data pribadi serta dokumen organisasi.

### 3.2 Non-Tujuan (di luar MVP kecuali disepakati)

- Pembayaran.
- Aplikasi mobile native.
- Chat real-time.
- Integrasi eksternal besar.

## 4. Pengguna dan Stakeholder

| Persona | Deskripsi | Kebutuhan utama |
| --- | --- | --- |
| Volunteer | Individu yang mendaftar akun dan mengikuti program | Daftar akun, lengkapi profil, cari program, ajukan aplikasi, lihat status dan riwayat |
| Perwakilan Mitra | Perwakilan organisasi yang mengajukan kemitraan | Daftar akun, isi profil organisasi, ajukan kemitraan, lacak status, revisi, ajukan proposal program, kelola program dan peserta |
| Admin PSA | Pengelola kemitraan dan program PSA | Tinjau pengajuan dan proposal, minta revisi, putuskan, kelola data, lihat analitik dan laporan |
| Product Owner (PSA) | Pengambil keputusan kebutuhan | Prioritas, acceptance, sign-off |

## 5. Ruang Lingkup

### 5.1 Public Website

Home, About PSA, Partners, Programs, Program Detail, Volunteer Opportunities, Become a Partner, Login, registrasi, FAQ, kontak, dan kebijakan privasi.

### 5.2 Volunteer Portal

Registrasi dan verifikasi email, profil volunteer, pencarian dan detail program, aplikasi program, status, notifikasi, dan riwayat.

### 5.3 Partner Portal

Registrasi akun perwakilan dan profil organisasi, pengajuan kemitraan, pelacakan status dan revisi, proposal program collaboration, manajemen program, daftar peserta, analitik, dan laporan.

### 5.4 PSA Admin Dashboard

Overview, review pengajuan kemitraan dan proposal program, manajemen mitra/program/peserta, analitik gender dan lokasi, laporan, ekspor, manajemen role, dan audit trail.

## 6. Prioritas Fitur (MoSCoW)

### Must Have (MVP)

- Public website dasar.
- Registrasi, login, dan verifikasi email.
- Role-based access control (RBAC).
- Registrasi dan profil volunteer.
- Daftar dan detail program, serta aplikasi peserta.
- Registrasi perwakilan mitra dan profil organisasi.
- Pengajuan kemitraan, status, revisi, dan admin review.
- Proposal collaboration dan manajemen program.
- Daftar peserta per program.
- Analitik dasar program, mitra, kota, dan provinsi.
- Audit trail untuk perubahan status penting.
- Backup, logging, dan error handling.

### Should Have

- Notifikasi email untuk perubahan status.
- Save draft untuk form panjang.
- Export CSV/XLSX.
- Filter analitik berdasarkan periode, mitra, program.
- Multi-user untuk satu organisasi.

### Could Have

- Rekomendasi program.
- Sertifikat partisipasi.
- Integrasi kalender atau CRM.
- Dashboard analitik lanjutan.

### Won't Have (MVP)

Pembayaran, aplikasi mobile native, chat real-time, integrasi eksternal besar.

## 7. Alur Pengguna Utama

1. **Volunteer:** registrasi → verifikasi email → lengkapi profil → cari program → ajukan aplikasi → pantau status.
2. **Mitra:** registrasi perwakilan → isi profil organisasi dan unggah dokumen → ajukan kemitraan → (jika diminta) revisi dan kirim ulang → disetujui atau ditolak.
3. **Proposal program:** mitra disetujui → ajukan proposal program → admin review (setuju / minta revisi / tolak) → publikasi program.
4. **Admin:** tinjau pengajuan dan proposal → putuskan dengan catatan → pantau peserta dan analitik → ekspor laporan.

## 8. Kebutuhan Fungsional

Prioritas mengikuti bagian 6. Setiap ID dapat diturunkan menjadi user story dan acceptance criteria pada fase Requirements.

### 8.1 Autentikasi, Akun, dan Role

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-AUTH-01 | Pengguna dapat registrasi akun volunteer dan akun perwakilan mitra. | Must |
| FR-AUTH-02 | Sistem mengirim email verifikasi dan menyediakan resend verifikasi. | Must |
| FR-AUTH-03 | Pengguna dapat login, logout, dan reset password. | Must |
| FR-AUTH-04 | Akses dibatasi oleh role (Volunteer, Mitra, Admin PSA) dan ditegakkan di sisi server. | Must |
| FR-AUTH-05 | Session kedaluwarsa ditangani dengan pesan yang jelas. | Must |
| FR-AUTH-06 | Satu organisasi dapat memiliki beberapa pengguna. | Should |

### 8.2 Volunteer

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-VOL-01 | Volunteer mengelola profil (field wajib/opsional ditetapkan bersama PSA). | Must |
| FR-VOL-02 | Volunteer mencari dan melihat detail program. | Must |
| FR-VOL-03 | Volunteer mengajukan aplikasi ke program dan melihat statusnya. | Must |
| FR-VOL-04 | Volunteer melihat riwayat aplikasi. | Must |
| FR-VOL-05 | Volunteer menerima notifikasi perubahan status. | Should |

### 8.3 Mitra dan Kemitraan

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-PTR-01 | Perwakilan mengelola profil organisasi dan mengunggah dokumen yang dibutuhkan. | Must |
| FR-PTR-02 | Sistem mencegah duplikasi organisasi; pengguna dapat meminta akses ke organisasi yang sudah terdaftar. | Must |
| FR-PTR-03 | Mitra mengajukan kemitraan, melacak status, dan merevisi pengajuan atas permintaan admin. | Must |
| FR-PTR-04 | Mitra yang disetujui mengajukan proposal program collaboration dan melacak statusnya. | Must |
| FR-PTR-05 | Mitra mengelola program (termasuk publikasi setelah disetujui). | Must |
| FR-PTR-06 | Mitra melihat daftar peserta program miliknya saja. | Must |
| FR-PTR-07 | Mitra melihat analitik dan laporan program miliknya. | Must |
| FR-PTR-08 | Form panjang mendukung save draft. | Should |

### 8.4 Admin PSA

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-ADM-01 | Dashboard overview ringkasan aktivitas. | Must |
| FR-ADM-02 | Review pengajuan kemitraan: setuju, minta revisi, tolak, dengan catatan. | Must |
| FR-ADM-03 | Review proposal program dengan keputusan serupa. | Must |
| FR-ADM-04 | Manajemen mitra, program, dan peserta. | Must |
| FR-ADM-05 | Analitik dasar per program, mitra, kota, dan provinsi. | Must |
| FR-ADM-06 | Audit trail untuk perubahan status penting (siapa, kapan, apa). | Must |
| FR-ADM-07 | Manajemen role dan hak akses. | Must |
| FR-ADM-08 | Ekspor laporan CSV/XLSX. | Should |
| FR-ADM-09 | Filter analitik berdasarkan periode, mitra, program. | Should |
| FR-ADM-10 | Statistik gender hanya jika data dikumpulkan secara tepat dan relevan (menunggu kebijakan, lihat bagian 14). | Should |

### 8.5 Status dan Transisi

Status dan transisi harus didefinisikan sejak fase analisis agar konsisten. Usulan awal (untuk divalidasi PSA):

| Objek | Status usulan |
| --- | --- |
| Pengajuan kemitraan | Draft → Submitted → Under Review → Revision Requested → Approved / Rejected |
| Proposal program | Draft → Submitted → Under Review → Revision Requested → Approved → Published / Rejected |
| Aplikasi volunteer | Submitted → Accepted / Rejected / Withdrawn (→ Attended, jika kehadiran dicatat) |

Setiap perubahan status penting dicatat dalam audit trail.

## 9. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
| --- | --- |
| Keamanan | Autentikasi aman, manajemen session, validasi upload file, perlindungan API, dan konfigurasi aman. Secrets tidak disimpan di repository. |
| Otorisasi | Isolasi data antar-volunteer dan antar-mitra, ditegakkan di server dan diuji lintas role. |
| Privasi | Dokumen sensitif disimpan di private storage dengan validasi akses. Kebijakan privasi tersedia. |
| Performa | Halaman, query, daftar peserta, dan ekspor diuji performanya. Target angka ditetapkan bersama PSA. |
| Aksesibilitas dan responsif | Seluruh halaman responsif dan aksesibel. |
| Keandalan | Backup terjadwal dan restore test berkala; logging, monitoring, dan error handling. |
| Kualitas data | Master data kota/provinsi untuk normalisasi lokasi; validasi untuk mencegah duplikasi organisasi. |
| Environment | Development, staging, dan production terpisah; domain dan HTTPS di production. |
| Email | Pengiriman email dipantau, retry terbatas, dan tersedia alur resend. |

## 10. Model Data (Entitas Utama, Tingkat Tinggi)

Data dictionary dan ERD detail disusun pada fase Requirements dan Design.

- **User** (akun, role, status verifikasi)
- **Volunteer Profile**
- **Organization** dan **Organization Member**
- **Organization Document** (private storage)
- **Partnership Application** (dengan riwayat status)
- **Program Proposal** (dengan riwayat status)
- **Program**
- **Program Application** (aplikasi peserta)
- **Notification**
- **Audit Log**
- **Master Lokasi** (kota, provinsi)

## 11. Metrik Keberhasilan

Baseline dan target ditetapkan bersama PSA sebelum launch.

| Kategori | Metrik |
| --- | --- |
| Adopsi | Akun volunteer terverifikasi; pengajuan kemitraan dimulai dan diselesaikan; persentase pengguna yang menyelesaikan registrasi |
| Proses | Waktu penyelesaian form; waktu review pengajuan; persentase pengajuan yang memerlukan revisi; persentase alur selesai tanpa bantuan |
| Program | Mitra aktif dan program aktif; pendaftar, peserta diterima, dan peserta hadir; distribusi peserta per kota/provinsi; statistik gender (jika dikumpulkan dengan tepat) |
| Teknis | Uptime, error rate, response time; defect kritis pascarilis; keberhasilan backup dan restore test |

## 12. Rencana Rilis

**Metodologi:** Agile dengan sprint 1–2 minggu dan approval gate yang jelas.

| Sprint | Fokus |
| --- | --- |
| Sprint 0 | Repository, environment, CI checks, database migration, logging |
| Sprint 1 | Registrasi/login, verifikasi email, reset password, role dan profil awal |
| Sprint 2 | Profil organisasi, dokumen, pengajuan kemitraan, status, admin review |
| Sprint 3 | Proposal collaboration, review/revisi, manajemen program, publikasi |
| Sprint 4 | Profil volunteer, daftar program, aplikasi peserta, status, dashboard |
| Sprint 5 | Daftar peserta, analitik mitra/program, distribusi kota/provinsi, laporan |
| Sprint 6 | Perbaikan QA, aksesibilitas, responsivitas, security review, release candidate |

Sprint adalah rencana awal, bukan janji durasi.

**Estimasi indikatif:** sekitar 10–16 minggu (Planning 1 minggu, Requirements 1–2, UX/UI dan Architecture 2–3, Development MVP 5–8, QA 2–3 sebagian paralel, UAT 1, Deployment 1). Estimasi dikalibrasi ulang setelah tim, teknologi, aturan approval, kebutuhan laporan, dan integrasi ditetapkan.

**Strategi peluncuran:** soft launch internal → pilot dengan beberapa mitra → perbaikan → peluncuran publik bertahap.

## 13. Pengujian dan Acceptance

- **Jenis testing:** unit, integration, end-to-end, authorization, security, performance, responsive/accessibility, dan regression.
- **Skenario kunci:**
  - Volunteer registrasi → verifikasi → profil → aplikasi program.
  - Mitra registrasi → pengajuan → revisi admin → kirim ulang.
  - Mitra disetujui → proposal program → approval → publikasi.
  - Admin melihat agregat peserta per program, kota, dan provinsi.
  - Penanganan error, file tidak valid, dan session kedaluwarsa.
- **UAT:** dilakukan oleh perwakilan PSA, mitra, volunteer, dan product owner; hasil berupa accept / conditional accept / reject dan sign-off PSA.
- **Kriteria keluar QA:** tidak ada defect blocker/critical yang belum ditangani tanpa keputusan risiko eksplisit.
- **Definition of Ready:** tujuan jelas, acceptance criteria, desain/flow memadai, dependensi diketahui, aturan akses dan data dipahami, dapat diprioritaskan product owner.
- **Definition of Done:** acceptance criteria terpenuhi, code review selesai, tes lulus, validasi/error handling dan akses role benar, responsif dan aksesibel, blocker ditangani, dokumentasi diperbarui.

## 14. Asumsi, Dependensi, dan Pertanyaan Terbuka

### Asumsi

- Scope MVP disetujui dan kapasitas tim memadai.
- Tidak ada integrasi eksternal besar yang belum diketahui.
- Daftar status di bagian 8.5 adalah usulan awal.

### Pertanyaan terbuka untuk PSA

1. Siapa product owner dan pengambil keputusan akhir?
2. Field wajib dan opsional untuk volunteer dan organisasi apa saja?
3. Dokumen organisasi apa yang wajib diunggah mitra?
4. Apakah data gender dikumpulkan? Jika ya, bagaimana kebijakan dan persetujuan penggunaannya?
5. Apakah satu organisasi boleh memiliki beberapa pengguna sejak MVP?
6. Apakah kehadiran peserta (attended) dicatat di platform?
7. Teknologi, hosting, email, dan storage apa yang akan dipakai?
8. Berapa target angka untuk performa dan metrik keberhasilan?
9. Siapa yang menyetujui program sebelum dipublikasikan, dan apakah ada aturan SLA review?

## 15. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Perubahan scope berulang | Product backlog dan approval perubahan |
| Status pengajuan tidak konsisten | Definisikan status dan transisi sejak analisis |
| Data organisasi duplikat | Validasi dan proses meminta akses organisasi |
| Data antar-mitra bocor | Authorization server-side dan pengujian lintas role |
| Lokasi tidak konsisten | Master data kota/provinsi dan normalisasi |
| Email verifikasi gagal | Monitoring, retry terbatas, resend flow |
| Dokumen sensitif terekspos | Private storage dan validasi akses |
| MVP terlalu besar | Fokus pada Must Have |
| Backup tidak bisa dipulihkan | Jadwalkan restore test, bukan hanya backup |

## 16. Pengelolaan Perubahan

Permintaan perubahan dicatat, dianalisis dampaknya (UX, data, keamanan, biaya, jadwal), diprioritaskan, lalu disetujui, ditunda, atau ditolak oleh product owner. Requirement, desain, backlog, dan acceptance criteria diperbarui, kemudian diimplementasikan, diuji, dan dicatat di changelog. Perubahan yang memengaruhi data pribadi, role, approval, atau akses lintas organisasi memerlukan review khusus.

## 17. Peran Tim

| Peran | Tanggung jawab |
| --- | --- |
| Product Owner / PSA Representative | Prioritas, keputusan kebutuhan, acceptance |
| Project Manager / Scrum Master | Jadwal, risiko, koordinasi sprint |
| Business Analyst | Requirements dan proses bisnis |
| UI/UX Designer | Flow, wireframe, prototype, design system |
| Frontend Developer | UI, responsivitas, integrasi frontend |
| Backend Developer | API, business rules, database, auth |
| QA Engineer | Test plan, pengujian, defect tracking |
| DevOps / Platform Engineer | Environment, deployment, monitoring, backup |
| Security/Privacy Reviewer | Review akses, data, dan risiko keamanan |

Pada tim kecil, satu orang dapat memegang beberapa peran selama tanggung jawab tetap jelas.
