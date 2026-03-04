# Payment Notification Feature

## Overview
Fitur Payment Notification memungkinkan admin untuk mengirim email notifikasi pembayaran kepada player yang sudah melakukan konfirmasi partisipasi tournament.

## Fitur Utama

### 1. Tab Interface di News Detail Modal
- **Tab "Invited Players"**: Menampilkan daftar player yang diundang dan status konfirmasi mereka
- **Tab "Send Payment Notification"**: Form untuk mengirim email notifikasi pembayaran

### 2. Email Notification Form
Form mencakup:
- **Email Subject**: Judul email yang akan dikirim
- **Email Content**: Konten pesan yang dapat disesuaikan
- **Player Selection**: Checkbox untuk memilih player yang akan menerima email
- **Select All**: Tombol untuk memilih semua player yang sudah konfirmasi

### 3. Email Template
Email yang dikirim memiliki desain profesional dengan:
- Header dengan logo Golf Score (full-color-mark.png)
- Gradient background merah (brand color)
- Personalisasi dengan nama player
- Konten custom dari admin
- Detail tournament (jika ada)
- Footer profesional

### 4. Player Filtering
Hanya player yang sudah melakukan konfirmasi yang bisa dipilih untuk menerima email notifikasi.

## Cara Penggunaan

### Untuk Admin

1. **Buka News Management**
   - Navigate ke Admin Dashboard → News Management

2. **Pilih News dengan Tournament**
   - Klik tombol "View Confirmations" (ikon clipboard) pada news card yang memiliki tournament terkait

3. **Akses Tab "Send Payment Notification"**
   - Di modal yang muncul, klik tab "Send Payment Notification"

4. **Isi Form Email**
   - **Subject**: Masukkan judul email (default: "Payment Reminder - Tournament Registration")
   - **Content**: Tulis pesan notifikasi pembayaran
   - Contoh konten:
     ```
     Terima kasih telah mengkonfirmasi partisipasi Anda dalam tournament.
     
     Untuk menyelesaikan registrasi, mohon lakukan pembayaran sebesar Rp 500.000 ke:
     
     Bank BCA
     No. Rekening: 1234567890
     Atas Nama: Golf Score Tournament
     
     Setelah melakukan pembayaran, mohon kirim bukti transfer ke WhatsApp: 0812-3456-7890
     
     Batas waktu pembayaran: 3 hari sebelum tournament dimulai.
     ```

5. **Pilih Recipients**
   - Centang player yang akan menerima email
   - Atau klik "Select All Confirmed" untuk memilih semua player yang sudah konfirmasi
   - Status player ditampilkan dengan badge:
     - **Confirmed**: Player sudah konfirmasi
     - **Paid**: Player sudah ditandai sebagai sudah bayar

6. **Kirim Email**
   - Klik tombol "Send Email to X Players"
   - Tunggu proses pengiriman selesai
   - Alert akan muncul menampilkan hasil pengiriman

## Technical Details

### Database Schema

#### email_logs Table
```typescript
{
  newsId: Id<"news">,
  sentBy: Id<"users">,
  recipients: Id<"users">[],
  subject: string,
  content: string,
  sentAt: number,
  results: {
    success: boolean,
    email: string
  }[]
}
```

### Backend Functions

#### convex/emailNotifications.ts
- `sendPaymentNotification`: Mutation untuk mengirim email ke multiple players

#### convex/emailActions.ts
- `sendEmail`: Action untuk mengirim email individual menggunakan email service

### Email Configuration

**Sender Email**: titleistteam@gmail.com
**App Password**: agtdtxhcagkmvjoc

Untuk setup production, lihat: `convex/EMAIL_SETUP.md`

## Email Template Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Meta tags -->
  </head>
  <body>
    <!-- Header with Logo and Gradient -->
    <table>
      <tr>
        <td style="background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%)">
          <img src="logo-url" />
          <h1>Payment Notification</h1>
        </td>
      </tr>
      
      <!-- Content Section -->
      <tr>
        <td>
          <p>Dear [Player Name],</p>
          
          <!-- Custom Message Box -->
          <div style="border-left: 4px solid #8B0000">
            <h2>[Subject]</h2>
            <div>[Content]</div>
          </div>
          
          <!-- Tournament Details (if applicable) -->
          <div style="background: #fff8e1">
            <h3>🏆 Tournament Details</h3>
            <table>
              <tr><td>Tournament:</td><td>[Name]</td></tr>
              <tr><td>Date:</td><td>[Date]</td></tr>
              <tr><td>Location:</td><td>[Location]</td></tr>
            </table>
          </div>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td style="background: #2e2e2e">
          <p>© 2024 Golf Score. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## Features

### ✅ Implemented
- Tab interface untuk Invited Players dan Payment Notification
- Form email dengan subject dan content
- Multiple player selection dengan checkbox
- Select all functionality
- Email template dengan design profesional
- Logo integration
- Tournament details dalam email
- Email logging ke database
- Success/failure tracking
- Loading states dan disabled states

### 🔄 Future Enhancements
- Email preview sebelum kirim
- Template email yang bisa disimpan
- Scheduled email sending
- Email tracking (open rate, click rate)
- Attachment support untuk bukti pembayaran
- Email history view
- Resend failed emails
- Email templates library

## Security Considerations

1. **Authorization**: Hanya admin yang bisa mengirim email
2. **Validation**: Subject dan content harus diisi
3. **Rate Limiting**: Perlu implementasi untuk mencegah spam
4. **Email Logging**: Semua email dicatat di database
5. **Error Handling**: Graceful error handling dengan user feedback

## Testing

### Manual Testing Checklist
- [ ] Tab switching works correctly
- [ ] Form validation works
- [ ] Player selection works
- [ ] Select all/deselect all works
- [ ] Email sending shows loading state
- [ ] Success message displays correctly
- [ ] Error handling works
- [ ] Email logs are created
- [ ] Only confirmed players are shown
- [ ] Tournament details display correctly

### Email Testing
- [ ] Email arrives in inbox
- [ ] Email design renders correctly
- [ ] Logo displays correctly
- [ ] Links work (if any)
- [ ] Mobile responsive
- [ ] Works in Gmail
- [ ] Works in Outlook
- [ ] Doesn't go to spam

## Troubleshooting

### Email tidak terkirim
1. Check console untuk error messages
2. Verify email credentials di `convex/emailActions.ts`
3. Check email_logs table untuk error details
4. Verify Gmail app password masih valid

### Email masuk spam
1. Setup SPF, DKIM, DMARC records
2. Gunakan dedicated email service (SendGrid, AWS SES)
3. Avoid spam trigger words
4. Add unsubscribe link

### Design email rusak
1. Test di berbagai email clients
2. Use inline CSS only
3. Avoid complex layouts
4. Test responsive design

## Support

Untuk pertanyaan atau issues:
1. Check `convex/EMAIL_SETUP.md` untuk setup details
2. Review email_logs table untuk debugging
3. Contact development team

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- Tab interface
- Email form
- Player selection
- Email template
- Logging system
