# Aplikasi Manajemen Toko Modern

![Tampilan Dashboard Aplikasi Toko Modern](https://github.com/user-attachments/assets/48a0616c-282c-4bcf-b920-b65ae65fc6ba)

Selamat datang di repositori **Aplikasi Toko Modern**, sebuah aplikasi web fungsional yang dibangun sebagai implementasi tugas besar mata kuliah Basis Data. Aplikasi ini dirancang untuk mengelola inventaris, supplier, kategori, dan data toko secara efisien dengan antarmuka yang modern dan responsif.

**Lihat Demo Langsung:** [https://tokoapp.vercel.app/](https://tokoapp.vercel.app/)

---

## 🌟 Fitur Utama

Aplikasi ini dilengkapi dengan berbagai fitur untuk memenuhi kebutuhan manajemen toko:

* **Autentikasi & Manajemen Pengguna**:
    * Sistem **Login & Registrasi** yang aman.
    * **Hak Akses Berbasis Peran (Role-Based Access Control)**: Membedakan antara **Admin** (akses penuh) dan **Pengguna Biasa** (hanya lihat).
* **Dashboard Interaktif**:
    * Menampilkan ringkasan data penting seperti total barang, stok, supplier, dan toko.
    * Visualisasi data penjualan dan keuntungan bulanan menggunakan grafik.
    * Menampilkan daftar produk yang baru ditambahkan.
* **Manajemen Data (CRUD Penuh untuk Admin)**:
    * **Data Barang**: Tambah, lihat, edit, hapus, dan cari produk.
    * **Data Kategori**: Kelola kategori produk secara terpusat.
    * **Data Supplier**: Kelola informasi pemasok barang.
    * **Data Toko**: Kelola informasi cabang toko.
* **Laporan & Analitik**:
    * Grafik stok berdasarkan kategori.
    * Tabel peringatan untuk produk dengan stok menipis.
    * Ringkasan total nilai inventori dan rata-rata harga barang.
* **Antarmuka Pengguna Modern**:
    * Desain **responsif** yang optimal di desktop maupun mobile.
    * UI yang bersih dan intuitif untuk kemudahan penggunaan.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend**: React.js
* **Backend & Database**: Supabase (PostgreSQL)
* **Styling**: Tailwind CSS
* **Grafik & Chart**: Recharts
* **Ikon**: Lucide React
* **Deployment**: Vercel

---

## 🗄️ Desain Database

Database dirancang dengan beberapa tabel yang saling berelasi untuk menjaga integritas data:

* `profiles`: Menyimpan data tambahan pengguna seperti nama dan role (terhubung *one-to-one* dengan tabel `auth.users`).
* `products`: Tabel utama yang terhubung dengan `categories` dan `suppliers` menggunakan *foreign key*.
* `categories`, `suppliers`, `stores`: Tabel master untuk data masing-masing entitas.
* `sales`: Menyimpan data historis untuk keperluan laporan.

Keamanan diatur menggunakan **Row Level Security (RLS)** di PostgreSQL, yang memastikan hanya admin yang dapat melakukan operasi tulis (`INSERT`, `UPDATE`, `DELETE`).

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Untuk menjalankan proyek ini di komputer Anda, ikuti langkah-langkah berikut:

1.  **Clone Repositori**
    ```bash
    git clone [https://github.com/andidelouise/tokoapp.git](https://github.com/andidelouise/tokoapp.git)
    cd tokoapp
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Database Supabase**
    * Buat proyek baru di [Supabase](https://supabase.com).
    * Buka **SQL Editor** dan jalankan skrip SQL yang ada di [sini](https://github.com/andidelouise/skrip-code-SQL) untuk membuat semua tabel dan RLS. (Anda perlu membuat file `SETUP.sql` dan menempelkan skrip SQL dari saya sebelumnya ke sana).

4.  **Setup Environment Variables**
    * Buat file `.env.local` di folder root proyek.
    * Isi file tersebut dengan kunci dari Supabase:
        ```env
        REACT_APP_SUPABASE_URL=URL_PROYEK_ANDA
        REACT_APP_SUPABASE_ANON_KEY=KUNCI_ANON_ANDA
        ```

5.  **Jalankan Aplikasi**
    ```bash
    npm start
    ```
    Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🔑 Kredensial Demo

Anda bisa menggunakan akun berikut untuk mencoba aplikasi:

* **Role Admin**:
    * **Email**: `admin@toko.com`
    * **Password**: `password123`
* **Role Pengguna Biasa**:
    * **Email**: `user@toko.com`
    * **Password**: `password123`

---

Proyek ini dibuat untuk memenuhi tugas besar mata kuliah Basis Data.
Oleh: **ANDI NUGROHO - 230511179**
)
