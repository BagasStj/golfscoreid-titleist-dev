# Quick Start: Payment Notification

## Panduan Cepat untuk Admin

### Langkah 1: Buat News dengan Tournament
1. Buka **Admin Dashboard** → **News Management**
2. Klik tombol **"Create News"**
3. Isi form:
   - Title: "Undangan Tournament Golf Championship 2024"
   - Excerpt: "Anda diundang untuk mengikuti tournament..."
   - Content: Detail lengkap tournament
   - Category: **Tournament**
   - Target Audience: Pilih sesuai kebutuhan
   - **Related Tournament**: Pilih tournament yang akan diselenggarakan
   - Status: **Published**
4. Klik **"Create News"**

### Langkah 2: Tunggu Player Konfirmasi
- Player akan melihat news di mobile app mereka
- Player dapat konfirmasi partisipasi dengan klik tombol "Confirm Participation"
- Status konfirmasi akan tercatat di sistem

### Langkah 3: Kirim Payment Notification
1. Di **News Management**, cari news yang sudah dibuat
2. Klik tombol **"View Confirmations"** (ikon clipboard biru)
3. Modal akan terbuka dengan 2 tab:
   - **Invited Players**: Lihat daftar player dan status
   - **Send Payment Notification**: Kirim email

### Langkah 4: Isi Form Email
1. Klik tab **"Send Payment Notification"**
2. Isi form:

   **Email Subject** (contoh):
   ```
   Payment Reminder - Golf Championship 2024
   ```

   **Email Content** (contoh):
   ```
   Terima kasih telah mengkonfirmasi partisipasi Anda dalam Golf Championship 2024.

   Untuk menyelesaikan registrasi, mohon lakukan pembayaran sebesar Rp 500.000 ke:

   Bank BCA
   No. Rekening: 1234567890
   Atas Nama: Golf Score Tournament

   Setelah melakukan pembayaran, mohon kirim bukti transfer ke:
   WhatsApp: 0812-3456-7890
   Email: titleistteam@gmail.com

   Batas waktu pembayaran: 3 hari sebelum tournament dimulai.

   Terima kasih atas partisipasi Anda!
   ```

### Langkah 5: Pilih Recipients
- Centang player yang akan menerima email
- Atau klik **"Select All Confirmed"** untuk pilih semua
- Pastikan hanya player yang sudah konfirmasi yang dipilih

### Langkah 6: Kirim Email
1. Klik tombol **"Send Email to X Players"**
2. Tunggu proses pengiriman (akan muncul loading indicator)
3. Alert akan muncul dengan hasil:
   - Jumlah email yang berhasil dikirim
   - Jumlah email yang gagal (jika ada)

### Langkah 7: Tandai Player yang Sudah Bayar
1. Kembali ke tab **"Invited Players"**
2. Setelah player melakukan pembayaran dan mengirim bukti
3. Klik tombol **"Mark as Paid"** pada player tersebut
4. Status akan berubah menjadi **"Paid"**

## Tips & Best Practices

### ✅ Do's
- Kirim payment reminder 1-2 minggu sebelum tournament
- Sertakan detail lengkap pembayaran (bank, nomor rekening, jumlah)
- Berikan batas waktu pembayaran yang jelas
- Sertakan kontak person untuk pertanyaan
- Tandai player sebagai "Paid" setelah verifikasi pembayaran

### ❌ Don'ts
- Jangan kirim email terlalu sering (spam)
- Jangan lupa update status "Paid" setelah verifikasi
- Jangan kirim ke player yang belum konfirmasi
- Jangan gunakan bahasa yang terlalu formal atau kaku

## Template Email yang Baik

### Template 1: Payment Reminder Pertama
```
Subject: Payment Reminder - [Tournament Name]

Dear [Player Name],

Terima kasih telah mengkonfirmasi partisipasi Anda dalam [Tournament Name].

Untuk menyelesaikan registrasi, mohon lakukan pembayaran sebesar [Amount] ke:

Bank: [Bank Name]
No. Rekening: [Account Number]
Atas Nama: [Account Name]

Batas waktu pembayaran: [Deadline]

Setelah melakukan pembayaran, mohon kirim bukti transfer ke:
WhatsApp: [Phone Number]
Email: [Email Address]

Terima kasih!
```

### Template 2: Payment Reminder Kedua (Menjelang Deadline)
```
Subject: Urgent: Payment Deadline - [Tournament Name]

Dear [Player Name],

Ini adalah pengingat bahwa batas waktu pembayaran untuk [Tournament Name] akan berakhir dalam [X] hari.

Jika Anda sudah melakukan pembayaran, mohon abaikan email ini.

Jika belum, mohon segera lakukan pembayaran ke:
[Payment Details]

Untuk pertanyaan, hubungi:
[Contact Information]

Terima kasih!
```

### Template 3: Payment Confirmation
```
Subject: Payment Confirmed - [Tournament Name]

Dear [Player Name],

Pembayaran Anda untuk [Tournament Name] telah kami terima dan dikonfirmasi.

Detail Tournament:
- Tanggal: [Date]
- Lokasi: [Location]
- Waktu: [Time]

Kami tunggu kehadiran Anda!

Terima kasih!
```

## Troubleshooting

### Email tidak terkirim?
1. Check koneksi internet
2. Verify email credentials masih valid
3. Check console browser untuk error messages
4. Hubungi technical support

### Player tidak menerima email?
1. Minta player check spam folder
2. Verify email address player benar
3. Coba kirim ulang
4. Gunakan alternatif komunikasi (WhatsApp)

### Status "Paid" tidak bisa diubah?
1. Refresh halaman
2. Check apakah player sudah konfirmasi
3. Logout dan login kembali
4. Hubungi technical support

## FAQ

**Q: Berapa lama email sampai ke player?**
A: Biasanya instant (beberapa detik), maksimal 5 menit.

**Q: Apakah bisa kirim email ke player yang belum konfirmasi?**
A: Tidak, hanya player yang sudah konfirmasi yang bisa menerima payment notification.

**Q: Apakah bisa edit email setelah dikirim?**
A: Tidak, email yang sudah dikirim tidak bisa diedit. Kirim email baru jika perlu koreksi.

**Q: Berapa banyak player yang bisa dipilih sekaligus?**
A: Tidak ada limit, bisa pilih semua player yang sudah konfirmasi.

**Q: Apakah ada history email yang dikirim?**
A: Ya, semua email tercatat di database (email_logs table).

**Q: Bagaimana cara tahu email berhasil dikirim?**
A: Alert akan muncul setelah proses selesai dengan detail jumlah sukses/gagal.

## Support

Butuh bantuan? Hubungi:
- Technical Support: [support-email]
- WhatsApp: [support-phone]
- Documentation: Check `PAYMENT_NOTIFICATION_FEATURE.md`
