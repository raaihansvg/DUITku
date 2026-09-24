# Aplikasi DUITku - Expense Tracker Mahasiswa

Aplikasi web untuk membantu mahasiswa mengelola keuangan pribadi secara sederhana. Pengguna dapat membuat akun, masuk ke dalam aplikasi, mencatat pemasukan dan pengeluaran, melihat riwayat transaksi, serta memantau kondisi keuangan melalui informasi saldo, total pemasukan, dan total pengeluaran. Setiap pengguna hanya dapat mengakses dan mengelola data miliknya sendiri.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, PostgreSQL (Neon), library `pg` dan `bcryptjs`.

## User Story

Sebagai mahasiswa, saya ingin dapat mencatat pemasukan dan pengeluaran saya serta melihat saldo dan riwayat transaksi, sehingga saya dapat mengetahui kondisi keuangan saya dan mengatur pengeluaran dengan lebih baik.

Sebagai pengguna, saya ingin data transaksi saya hanya bisa dilihat dan diubah oleh saya sendiri, sehingga keuangan pribadi saya tetap aman.

[Demo](#)

## Daftar SRS

| Kode | Deskripsi | Acceptance Criteria |
| :--- | :--- | :--- |
| SRS-001 | Registrasi & Otentikasi Pengguna | - Pengguna dapat membuat akun baru (register) dengan nama, email, dan password.<br>- Email harus unik, tidak boleh ada dua akun dengan email yang sama.<br>- Password disimpan dalam bentuk hash, bukan teks asli.<br>- Pengguna dapat login dengan email dan password yang benar.<br>- Pengguna dapat logout. |
| SRS-002 | Manajemen Session | - Setelah login berhasil, sistem membuat session dan menyimpannya di cookie.<br>- Informasi login tetap tersimpan selama session masih berlaku (refresh halaman tidak membuat pengguna logout).<br>- Halaman dashboard hanya dapat diakses oleh pengguna yang sudah login.<br>- Pengguna yang belum login diarahkan ke halaman login. |
| SRS-003 | Cookies Preferensi Pengguna | - Sistem menyimpan minimal satu preferensi pengguna (contoh: tema terang/gelap) di cookies.<br>- Preferensi tetap tersimpan setelah halaman di-refresh atau browser dibuka kembali.<br>- Preferensi diterapkan otomatis pada tampilan aplikasi. |
| SRS-004 | Manajemen Transaksi (CRUD) | - Pengguna dapat menambahkan transaksi (tipe pemasukan/pengeluaran, nominal, kategori, keterangan, tanggal).<br>- Pengguna dapat mengubah transaksi miliknya.<br>- Pengguna dapat menghapus transaksi miliknya.<br>- Input divalidasi (nominal harus angka lebih dari 0, tipe dan tanggal wajib diisi). |
| SRS-005 | Riwayat Transaksi | - Dashboard menampilkan daftar transaksi milik pengguna yang sedang login.<br>- Transaksi diurutkan dari yang terbaru.<br>- Setiap transaksi menampilkan tipe, nominal, kategori, keterangan, dan tanggal. |
| SRS-006 | Ringkasan Keuangan | - Dashboard menampilkan total pemasukan.<br>- Dashboard menampilkan total pengeluaran.<br>- Dashboard menampilkan saldo (total pemasukan dikurangi total pengeluaran).<br>- Ringkasan diperbarui setelah transaksi ditambah, diubah, atau dihapus. |
| SRS-007 | Keamanan & Isolasi Data | - Setiap transaksi terhubung dengan pengguna pemilik (`user_id`).<br>- Pengguna hanya dapat melihat, mengubah, dan menghapus transaksi miliknya sendiri.<br>- Permintaan tanpa login ditolak (HTTP 401), permintaan ke data milik orang lain ditolak (HTTP 403/404).<br>- Seluruh input pengguna divalidasi sebelum diproses.<br>- Seluruh query database menggunakan query terparameterisasi (*prepared statement*) untuk mencegah SQL Injection. |

## Pembagian Tugas

Berdasarkan fitur di atas, berikut adalah pembagian untuk 3 orang (1 PM dan 2 developer):

### Project Manager (Fokus: Setup, Database, Layout, & Koordinasi)
- Setup awal proyek (Next.js), environment, dan repository GitHub.
- Setup database PostgreSQL dan desain schema (tabel `users` dan `transactions`).
- Membuat layout dasar dan halaman dashboard sebagai kerangka bersama.
- **SRS-007**: Memastikan isolasi data antar pengguna dan penggunaan query terparameterisasi berjalan di seluruh fitur.
- Mengatur workflow Git (branch per fitur), menangani conflict, dan merge ke branch `main`.
- Koordinasi tim dan pelaporan kondisi akhir proyek.

###  Opan (Fokus: Akun, Session, & Cookies)
- **SRS-001**: Mengembangkan fitur register, login, dan logout (termasuk hash password).
- **SRS-002**: Mengembangkan pengelolaan session dan proteksi halaman dashboard.
- **SRS-003**: Mengembangkan penyimpanan preferensi pengguna di cookies (contoh: tema).
- Membuat halaman UI untuk login dan register.

### Aji (Fokus: Transaksi & Ringkasan Keuangan)
- **SRS-004**: Mengembangkan fitur CRUD transaksi beserta validasi input.
- **SRS-005**: Mengembangkan tampilan riwayat transaksi di dashboard.
- **SRS-006**: Mengembangkan perhitungan saldo, total pemasukan, dan total pengeluaran.
- Membuat komponen UI form transaksi dan kartu ringkasan keuangan.