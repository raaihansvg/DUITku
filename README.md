# Aplikasi DUITku - Expense Tracker Mahasiswa

Aplikasi web untuk membantu mahasiswa mengelola keuangan pribadi secara sederhana. Pengguna dapat membuat akun, masuk ke dalam aplikasi, mencatat pemasukan dan pengeluaran, melihat riwayat transaksi, memfilter transaksi, menetapkan budget bulanan, serta memantau kondisi keuangan melalui informasi saldo, total pemasukan, total pengeluaran, dan penggunaan budget. Setiap pengguna hanya dapat mengakses dan mengelola data miliknya sendiri.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, PostgreSQL (Neon), library `pg` dan `bcryptjs`.

## User Story

Sebagai mahasiswa, saya ingin dapat mencatat pemasukan dan pengeluaran saya serta melihat saldo dan riwayat transaksi, sehingga saya dapat mengetahui kondisi keuangan saya dan mengatur pengeluaran dengan lebih baik.

Sebagai pengguna, saya ingin data transaksi saya hanya bisa dilihat dan diubah oleh saya sendiri, sehingga keuangan pribadi saya tetap aman.

Sebagai pengguna, saya ingin aplikasi memperbarui data tanpa memuat ulang seluruh halaman, sehingga penggunaan aplikasi terasa cepat dan nyaman.

Sebagai mahasiswa, saya ingin menetapkan anggaran pengeluaran setiap bulan dan melihat seberapa banyak yang sudah terpakai, sehingga saya tidak melebihi batas pengeluaran yang saya rencanakan.

[Demo](#)

## Daftar SRS

> **Keterangan:** 🆕 **Baru (Pertemuan 5)** = SRS yang ditambahkan pada Pertemuan 5. 🔄 **Diperbarui (Pertemuan 5)** = SRS lama yang acceptance criteria-nya diperluas (mencakup data budget). SRS-001 sampai SRS-006 berasal dari pertemuan sebelumnya.

| Kode | Deskripsi | Acceptance Criteria |
| :--- | :--- | :--- |
| SRS-001 | Registrasi & Otentikasi Pengguna | - Pengguna dapat membuat akun baru (register) dengan nama, email, dan password.<br>- Email harus unik, tidak boleh ada dua akun dengan email yang sama.<br>- Password disimpan dalam bentuk hash, bukan teks asli.<br>- Pengguna dapat login dengan email dan password yang benar.<br>- Pengguna dapat logout. |
| SRS-002 | Manajemen Session | - Setelah login berhasil, sistem membuat session dan menyimpannya di cookie.<br>- Informasi login tetap tersimpan selama session masih berlaku (refresh halaman tidak membuat pengguna logout).<br>- Halaman dashboard hanya dapat diakses oleh pengguna yang sudah login.<br>- Pengguna yang belum login diarahkan ke halaman login. |
| SRS-003 | Cookies Preferensi Pengguna | - Sistem menyimpan minimal satu preferensi pengguna (contoh: tema terang/gelap) di cookies.<br>- Preferensi tetap tersimpan setelah halaman di-refresh atau browser dibuka kembali.<br>- Preferensi diterapkan otomatis pada tampilan aplikasi. |
| SRS-004 | Manajemen Transaksi (CRUD) | - Pengguna dapat menambahkan transaksi (tipe pemasukan/pengeluaran, nominal, kategori, keterangan, tanggal).<br>- Pengguna dapat mengubah transaksi miliknya.<br>- Pengguna dapat menghapus transaksi miliknya.<br>- Input divalidasi (nominal harus angka lebih dari 0, tipe dan tanggal wajib diisi). |
| SRS-005 | Riwayat Transaksi | - Dashboard menampilkan daftar transaksi milik pengguna yang sedang login.<br>- Transaksi diurutkan dari yang terbaru.<br>- Setiap transaksi menampilkan tipe, nominal, kategori, keterangan, dan tanggal. |
| SRS-006 | Ringkasan Keuangan | - Dashboard menampilkan total pemasukan.<br>- Dashboard menampilkan total pengeluaran.<br>- Dashboard menampilkan saldo (total pemasukan dikurangi total pengeluaran).<br>- Ringkasan diperbarui setelah transaksi ditambah, diubah, atau dihapus. |
| SRS-007 | Keamanan & Isolasi Data<br>**🔄 Diperbarui (Pertemuan 5)** | - Setiap transaksi dan budget terhubung dengan pengguna pemilik (`user_id`).<br>- Pengguna hanya dapat melihat, mengubah, dan menghapus transaksi dan budget miliknya sendiri.<br>- Permintaan tanpa login ditolak (HTTP 401), permintaan ke data milik orang lain ditolak (HTTP 403/404).<br>- Seluruh input pengguna divalidasi sebelum diproses.<br>- Seluruh query database menggunakan query terparameterisasi (*prepared statement*) untuk mencegah SQL Injection. |
| SRS-008 | Implementasi AJAX (Dashboard, Transaksi & Filter)<br>**🆕 Baru (Pertemuan 5)** | - Data dashboard (ringkasan dan riwayat transaksi) dimuat melalui request asinkron (`fetch`) ke API Route, tanpa reload halaman penuh.<br>- Tambah, ubah, dan hapus transaksi dikirim melalui AJAX; daftar transaksi dan ringkasan langsung diperbarui tanpa refresh.<br>- Pengguna dapat memfilter transaksi (minimal berdasarkan tipe, kategori, dan rentang tanggal/bulan) dan hasil filter tampil tanpa reload halaman.<br>- Selama request berlangsung ditampilkan indikator loading, dan pesan error ditampilkan jika request gagal.<br>- API mengembalikan respons JSON dengan status HTTP yang sesuai (200, 201, 400, 401, 404). |
| SRS-009 | Budget Bulanan<br>**🆕 Baru (Pertemuan 5)** | - Pengguna dapat menetapkan budget pengeluaran untuk bulan tertentu (bulan, tahun, dan nominal).<br>- Satu pengguna hanya memiliki satu budget per bulan (kombinasi `user_id`, bulan, dan tahun unik).<br>- Pengguna dapat mengubah dan menghapus budget miliknya.<br>- Input divalidasi (nominal harus angka lebih dari 0, bulan dan tahun wajib diisi dan valid).<br>- Sistem menghitung budget terpakai dari total transaksi bertipe pengeluaran pada bulan tersebut.<br>- Dashboard menampilkan nominal budget, jumlah terpakai, sisa budget, dan persentase penggunaan (misalnya dalam bentuk progress bar).<br>- Sistem menampilkan peringatan ketika penggunaan mendekati batas (misalnya ≥ 80%) dan ketika budget terlampaui.<br>- Informasi budget diperbarui otomatis (via AJAX) setelah transaksi pengeluaran ditambah, diubah, atau dihapus.<br>- Pengguna hanya dapat melihat dan mengelola budget miliknya sendiri. |

## Pembagian Tugas

Berdasarkan fitur di atas, berikut adalah pembagian untuk 3 orang (1 PM dan 2 programmer):

### Opan – Project Manager (Fokus: Setup, Database, Layout, & Koordinasi)
- Setup awal proyek (Next.js), environment, dan repository GitHub.
- Setup database PostgreSQL dan desain schema (tabel `users`, `transactions`, dan `budgets`). **(Pertemuan 5)**
- Membuat layout dasar dan halaman dashboard sebagai kerangka bersama.
- **SRS-007**: Memastikan isolasi data antar pengguna dan penggunaan query terparameterisasi berjalan di seluruh fitur, termasuk fitur budget. **(Pertemuan 5)**
- **SRS-008**: Melakukan pengecekan menyeluruh penerapan AJAX di dashboard, manajemen transaksi, dan filter, lalu mencatat bagian yang belum sesuai untuk diperbaiki tim. **(Pertemuan 5)**
- Mengatur workflow Git (branch per fitur), menangani conflict, dan merge ke branch `main`.
- Koordinasi tim dan pelaporan kondisi akhir proyek.

### Aji – Programmer 1 (Fokus: Transaksi, Ringkasan Keuangan, & AJAX)
- **SRS-004**: Mengembangkan fitur CRUD transaksi beserta validasi input.
- **SRS-005**: Mengembangkan tampilan riwayat transaksi di dashboard.
- **SRS-006**: Mengembangkan perhitungan saldo, total pemasukan, dan total pengeluaran.
- **SRS-008**: Menerapkan AJAX pada dashboard dan manajemen transaksi, serta mengembangkan fitur filter transaksi berbasis AJAX. **(Pertemuan 5)**
- Membuat komponen UI form transaksi, filter, dan kartu ringkasan keuangan. **(Pertemuan 5)**

### Rehan – Programmer 2 (Fokus: Akun, Session, Cookies, & Budget)
- **SRS-001**: Mengembangkan fitur register, login, dan logout (termasuk hash password).
- **SRS-002**: Mengembangkan pengelolaan session dan proteksi halaman dashboard.
- **SRS-003**: Mengembangkan penyimpanan preferensi pengguna di cookies (contoh: tema).
- **SRS-009**: Mengembangkan fitur Budget Bulanan (API CRUD budget, perhitungan pemakaian dari transaksi pengeluaran, dan peringatan batas budget). **(Pertemuan 5)**
- Membuat halaman UI untuk login, register, serta komponen form dan kartu progress budget. **(Pertemuan 5)**
