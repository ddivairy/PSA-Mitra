-- 20261015000001_seed_initial_data.sql
-- Minimal Initial Data Seeding untuk PSA Partnership Platform (Hanya data esensial untuk testing & baseline)

-- 1. Users Esensial (1 Admin, 1 Partner, 1 Volunteer)
INSERT INTO public.users (id, name, email, phone, role, verified, avatar) VALUES
('user-admin-1', 'Dewi Anjani (Admin PSA)', 'admin.partnership@psa-platform.org', '081987654321', 'admin', true, null),
('user-partner-1', 'Siti Rahmawati, S.E.', 'siti.rahmawati@lestarihijau.id', '081398765432', 'partner', true, null),
('user-vol-1', 'Budi Santoso', 'budi.santoso@gmail.com', '081234567890', 'volunteer', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 2. Partner Organization Esensial (1 Mitra)
INSERT INTO public.partner_organizations (id, user_id, name, type, sector, description, website, address, province, city, pic_name, pic_role, pic_phone, pic_email, collaboration_reason, collaboration_focus, collaboration_objective, target_impact, offered_contribution, collaboration_period, status) VALUES
('org-1', 'user-partner-1', 'PT Bumi Lestari Hijau', 'corporate', 'Energi Berkelanjutan & Lingkungan Hidup', 'Perusahaan yang berfokus pada transisi energi terbarukan dan inisiatif restorasi ekosistem pesisir melalui program CSR berkelanjutan.', 'https://lestarihijau.id', 'Menara Hijau Lt. 14, Jl. MT Haryono Kav. 33', 'DKI Jakarta', 'Jakarta Selatan', 'Siti Rahmawati, S.E.', 'Head of CSR & Community Development', '081398765432', 'siti.rahmawati@lestarihijau.id', 'Ingin memperluas partisipasi pemuda dalam aksi nyata pemulihan kawasan mangrove pesisir utara Jakarta dan pesisir Jawa.', ARRAY['Lingkungan', 'Pemberdayaan Masyarakat'], 'Menanam 10.000 bibit mangrove dan membekali 200 relawan dengan wawasan konservasi laut pada tahun 2026.', 'Konservasi 5 hektar pesisir dan pemberdayaan 4 kelompok nelayan lokal.', 'Pendanaan bibit, fasilitasi logistik lapangan, pelatih ahli lingkungan, dan sertifikat partisipasi.', '12 Bulan (Maret 2026 - Februari 2027)', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Link org_id ke user-partner-1
UPDATE public.users SET org_id = 'org-1' WHERE id = 'user-partner-1';

-- 3. Program Esensial (1 Program Aktif Terpublikasi)
INSERT INTO public.programs (id, partner_id, partner_name, title, category, summary, description, objectives, format, province, city, address, start_date, end_date, schedule, target_quota, enrolled_count, requirements, accessibility_info, deadline, pic_name, pic_contact, proposal_status, published_status, image) VALUES
('prog-1', 'org-1', 'PT Bumi Lestari Hijau', 'Aksi Restorasi Mangrove & Edukasi Pesisir Muara Gembong', 'Lingkungan', 'Aksi nyata penanaman 2.500 bibit mangrove dan edukasi pelestarian pesisir bersama warga nelayan.', 'Program ini mengajak relawan turun langsung menanam bibit mangrove di kawasan pesisir yang terancam abrasi di Muara Gembong.', ARRAY['Menanam 2.500 bibit mangrove jenis Rhizophora', 'Mengedukasi 120 anak pesisir', 'Membangun jejaring relawan hijau'], 'offline', 'Jawa Barat', 'Kabupaten Bekasi', 'Kawasan Konservasi Mangrove Pesisir Muara Gembong', '2026-04-18', '2026-04-19', 'Sabtu - Minggu, 07:30 - 15:30 WIB', 40, 32, ARRAY['Usia minimal 18 tahun dan sehat jasmani', 'Bersedia beraktivitas di area berlumpur'], 'Jalur perahu sampan disediakan; medan berlumpur basah sehingga membutuhkan sepatu boots pelindung.', '2026-04-10', 'Siti Rahmawati, S.E.', '081398765432 / csr@lestarihijau.id', 'approved', 'published', '/images/program_mangrove_restoration_1791874041219.jpg')
ON CONFLICT (id) DO NOTHING;

-- 4. Volunteer Profile Esensial (1 Profil Relawan)
INSERT INTO public.volunteer_profiles (id, user_id, full_name, birth_date, gender, province, city, interests, education, skills, experience, availability, bio) VALUES
('vp-1', 'user-vol-1', 'Budi Santoso', '2001-08-14', 'male', 'DKI Jakarta', 'Jakarta Selatan', ARRAY['Pendidikan', 'Lingkungan', 'Teknologi & Digital'], 'S1 Teknik Informatika - Universitas Indonesia', ARRAY['Mentoring Anak', 'Literasi Digital', 'Dokumentasi Visual', 'Public Speaking'], 'Volunteer pengajar akhir pekan di Rumah Belajar Cipinang (2024-2025)', 'Akhir pekan (Sabtu-Minggu)', 'Penggiat edukasi digital dan kepedulian lingkungan hidup pesisir.')
ON CONFLICT (id) DO NOTHING;
