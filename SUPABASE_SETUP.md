# Panduan Integrasi Supabase & Vercel - Gemas Galore

Dokumen ini menjelaskan langkah-langkah menghubungkan database **Supabase** ke website **Gemas Galore** dan mengelolanya secara dinamis melalui **Vercel**.

---

## 📌 Langkah 1: Buat Project di Supabase (Gratis)

1. Buka [https://supabase.com](https://supabase.com) dan login/daftar (bisa menggunakan akun GitHub).
2. Klik tombol **"New Project"**.
3. Isi informasi project:
   * **Name:** `gemas-galore-db`
   * **Database Password:** Buat password yang kuat dan simpan baik-baik.
   * **Region:** Pilih `Singapore (ap-southeast-1)` (terdekat dengan Indonesia untuk akses tercepat).
4. Klik **"Create new project"** dan tunggu sekitar 1-2 menit hingga database selesai disiapkan.

---

## 📌 Langkah 2: Jalankan Database Schema (`schema.sql`)

1. Pada menu sebelah kiri dashboard Supabase, klik ikon **SQL Editor** (atau buka tab `SQL Editor`).
2. Klik **"New query"**.
3. Buka file [`schema.sql`](schema.sql) yang ada di folder project ini, salin (copy) seluruh isinya, lalu tempel (paste) ke SQL Editor Supabase.
4. Klik tombol **"Run"** (atau tekan `Ctrl + Enter`).
5. Selesai! Tabel `products`, `messages`, `resellers`, aturan keamanan RLS, dan 6 produk awal Gemas Galore sudah otomatis terbuat.

---

## 📌 Langkah 3: Masukkan API Keys ke Website

1. Di dashboard Supabase, klik ikon **Settings** (roda gigi) di pojok kiri bawah -> pilih **API**.
2. Salin 2 nilai berikut:
   * **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   * **Project API Keys** -> bagian **`anon` `public`** (key panjang yang berawalan `eyJ...`)
3. Buka file [`asset/js/supabase-config.js`](asset/js/supabase-config.js) di project Anda:
   ```javascript
   const SUPABASE_CONFIG = {
     url: "MASUKKAN_PROJECT_URL_DISINI",
     anonKey: "MASUKKAN_ANON_KEY_DISINI"
   };
   ```
4. Simpan file tersebut.

---

## 📌 Langkah 4: Buat Akun Admin untuk Login Dashboard

1. Di dashboard Supabase, klik menu **Authentication** (ikon gembok/orang di kiri) -> pilih tab **Users**.
2. Klik tombol **"Add user"** -> pilih **"Create user"**.
3. Masukkan:
   * **User Email:** email admin Anda (contoh: `admin@gemasgalore.com`)
   * **Password:** password login admin Anda
   * Centang opsi *Auto Confirm User* (jika ada).
4. Klik **"Create user"**.

---

## 📌 Langkah 5: Buka Admin Dashboard

1. Buka file [`admin.html`](admin.html) di browser Anda (atau via link **Admin** di footer website).
2. Masukkan email dan password yang baru saja Anda buat di Langkah 4.
3. Anda sekarang bisa:
   * ➕ **Menambah produk baru** (nama, foto, kategori, harga, bahan).
   * ✏️ **Mengubah harga & detail produk**.
   * 🗑️ **Menghapus produk**.
   * 💬 **Melihat pesan masuk dari pelanggan** dan membalas langsung ke WhatsApp mereka!
   * Produk yang Anda ubah di Admin akan langsung tampil secara dinamis di [`index.html`](index.html).

---

## 📌 Langkah 6: Deploy ke Vercel

Karena project Anda sudah terhubung ke Vercel:
1. Cukup lakukan Git commit & push ke repository GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: integrasi dinamis supabase dan admin portal"
   git push origin main
   ```
2. Vercel akan otomatis mendeteksi perubahan dan melakukan re-deploy dalam hitungan detik.
3. Website publik Anda di `https://gemasgalore.vercel.app/` dan halaman admin di `https://gemasgalore.vercel.app/admin.html` sudah resmi berjalan dinamis!

