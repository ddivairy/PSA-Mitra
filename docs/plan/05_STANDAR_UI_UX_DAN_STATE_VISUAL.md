# Standar UI/UX, Desain Sistem & Penanganan State Visual
## PSA Partnership Platform

**Kode Dokumen:** `SPEC-DESIGN-05` · **Fokus:** Desain Sistem, Palet Warna, Tipografi, Komponen Interaktif, Aksesibilitas, dan Manajemen State Visual

---

## 1. Fondasi Desain Sistem & Palet Warna (Punya Skill Academy Brand Colors)

Arah visual platform menerapkan identitas brand **Punya Skill Academy** yang modern, profesional, dan human-centered dengan disiplin rasio warna 60-30-10:

| Token Warna | Nilai HEX | Penggunaan Utama | Rasio Distribusi |
|---|---|---|---|
| **Primary Accent (Navy Blue)** | `#0B2238` | Sidebar navigasi floating, tombol aksi primer (*primary buttons*), kartu sorotan (*highlight cards*) | 30% (Elemen Struktural Utama) |
| **Secondary Accent (Steel/Slate Blue)** | `#5C80B6` | State aktif navigasi (*active states*), tombol sekunder, sub-header, border aksen | 10% (Aksen Tindakan & Fokus) |
| **Highlight/Callout (Coral Pink)** | `#E85D75` | Lencana status dinamis (*badges*), indikator status krusial, *notification dots*, tombol penolakan/batal | Aksen Sorotan / Notifikasi |
| **Background Surface (Light Neutral)** | `#F8FAFC` | Latar belakang seluruh kanvas platform (*page background canvas*) | 60% (Dominan Bersih & Lega) |
| **Card Background** | `#FFFFFF` | Latar kartu informasi (*cards*), dialog modal, panel formulir input | Surface Bersih & Kontras |
| **Text Primary** | `#0F172A` | Teks bacaan utama, judul headline, label formulir (*high contrast WCAG AA*) | Teks Utama |
| **Text Muted** | `#64748B` | Teks pendukung, *helper text*, metadata unboxed, tanggal dan sub-keterangan | Teks Sekunder |
| **Border Line** | `#E2E8F0` / `#F1F5F9` | Garis batas hairline halus pada kartu dan input field | Separator Elegan |
| **Success Status** | `#10B981` / `#059669` | Status Disetujui (*Approved*), Diterima (*Accepted*), Terverifikasi | Status Semantik |
| **Warning / Review Status** | `#F59E0B` / `#D97706` | Status Sedang Ditinjau (*Under Review*), Draf | Status Semantik |

---

## 2. Tipografi & Skala Teks

- **Font Utama Antarmuka**: `Plus Jakarta Sans` (Display & Body)
- **Font Angka & Data Tabular**: `JetBrains Mono` (`font-mono tabular-nums`) untuk nomor referensi, kuota, tanggal, dan metrik tabel.

| Tingkatan Teks | Ukuran Desktop | Ukuran Mobile | Weight & Keterangan |
|---|---|---|---|
| **Display Title (Hero)** | 36px – 48px | 28px – 32px | Bold (700) / Extrabold (800), line-height 1.15 |
| **Section Heading** | 24px – 28px | 20px – 24px | Bold (700), text-wrap balance |
| **Card / Modal Title** | 16px – 18px | 15px – 16px | Bold (700) |
| **Body Prose** | 14px – 16px | 14px | Regular (400), line-height 1.6 |
| **Form Label** | 12px – 13px | 12px | Semibold (600), terletak di atas input |
| **Helper Text / Metadata** | 11px – 12px | 11px | Regular (400), text-slate-500 |
| **Button Label** | 12px – 14px | 12px – 14px | Semibold (600), single-line whitespace-nowrap |

---

## 3. Disiplin Metadata & Anti-Slop Rules

Sesuai panduan kualitas visual tinggi:

1. **Zero-Pill Metadata**: Metadata statis (kategori, lokasi, tanggal, jumlah relawan) ditampilkan sebagai **teks bersih unboxed** dengan pemisah tipografis halus (`·` atau `/`), bukan dibungkus kapsul permen warna-warni secara berlebihan.
2. **Badge Status Fungsional**: Kapsul status hanya digunakan untuk merepresentasikan status resmi suatu entitas (`Approved`, `Under Review`, `Revision Required`, `Accepted`, `Waitlisted`, `Rejected`).
3. **No Hue-Only State Signaling**: Status tidak pernah disampaikan melalui warna saja. Wajib selalu dipasangkan dengan teks eksplisit dan ikon status pendukung untuk aksesibilitas ramah buta warna.
4. **Single-Elevation Depth**: Menghindari tumpukan kartu di dalam kartu (*nested cards*). Struktur konten dipisahkan oleh *whitespace* lega (24px - 32px) dan garis batas hairline 1px halus (`border-slate-200`).
5. **No Mechanical Clutter**: Tidak ada komentar kode (`//`), kode versi buatan, atau ticker teks buatan di bagian footer. Bahasa yang digunakan adalah bahasa sehari-hari yang lugas dan human-centered.

---

## 4. Penanganan 4 Kondisi State Visual (State Management)

Setiap halaman dan tabel formulir wajib menangani 4 kondisi state berikut:

### 4.1 Empty State (Kondisi Kosong)
- Muncul ketika belum ada data (misal: belum ada aplikasi relawan, belum ada proposal kegiatan, atau hasil pencarian nihil).
- **Elemen Wajib**:
  1. Ikon ilustrasi monokrom sederhana yang relevan (misal: ikon dokumen atau folder kosong).
  2. Judul pesan yang jelas (misal: *"Belum Ada Aplikasi Program"*).
  3. Teks eksplanasi 1-2 kalimat mengapa data belum ada.
  4. Tombol aksi solutif (CTA primer) untuk memandu langkah pengguna berikutnya (contoh: *"Jelajahi Program Sekarang"* atau *"Ajukan Proposal Pertama"*).

### 4.2 Loading State (Kondisi Memuat Data)
- Mencegah kebingungan pengguna saat data sedang diambil atau diproses.
- **Elemen Wajib**:
  1. Menggunakan *Skeleton Placeholder* dengan dimensi dan bentuk yang menyerupai kartu atau baris tabel yang sebenarnya.
  2. Tombol submit secara otomatis menampilkan teks *"Memproses..."* dan mengalami disable (*disabled state*) untuk mencegah pengiriman form berulang kali akibat klik ganda (*double-click*).

### 4.3 Success State (Kondisi Berhasil)
- Memberikan kepastian bahwa aksi pengguna berhasil tersimpan di sistem.
- **Elemen Wajib**:
  1. Toast notifikasi atau banner hijau berbatas jelas (*emerald-50*).
  2. Menampilkan nomor referensi unik (contoh: `REF: #APP-001`).
  3. Penjelasan langkah berikutnya yang harus dilakukan (contoh: *"Status dapat dipantau berkala pada menu Aplikasi Saya"*).

### 4.4 Error State (Kondisi Terjadi Masalah / Validasi Gagal)
- Menjelaskan letak kesalahan tanpa membingungkan pengguna.
- **Elemen Wajib**:
  1. Validasi inline langsung di bawah input terkait dengan teks pesan berwarna merah (`text-rose-600`) dan border input merah.
  2. Banner ringkasan kesalahan di bagian atas formulir jika terdapat beberapa field yang gagal divalidasi.
  3. Mempertahankan isian form yang sudah diisi oleh pengguna (*retain user input*) agar pengguna tidak perlu mengetik ulang dari awal.

---

## 5. Standar Aksesibilitas & Responsivitas (A11y & Mobile)

- **Target Sentuh Minimum (Touch Targets)**: Seluruh tombol interaktif memiliki tinggi minimum 44px di mobile dan 40px di desktop.
- **Navigasi Keyboard Penuh**: Seluruh input, tombol, tab, dan dialog modal dapat diakses menggunakan tombol `Tab`, `Enter`, `Space`, dan ditutup dengan tombol `Escape`.
- **Indikator Fokus Terlihat (`focus-visible`)**: Setiap elemen fokus memiliki *focus ring* biru berjarak 2px (`focus:ring-2 focus:ring-blue-500`).
- **Ponsel Satu Kolom (Single-Column Stacking)**: Pada layar di bawah 768px, grid multi-kolom secara otomatis tersusun menjadi satu kolom vertikal yang nyaman di-scroll.
