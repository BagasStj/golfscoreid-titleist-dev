# Payment Management Feature

## Overview
Fitur manajemen pembayaran untuk pemain yang memungkinkan admin untuk melacak status pembayaran setiap pemain dengan mudah.

## Features Added

### 1. Payment Status Field
- Menambahkan field `paymentStatus` dan `paidAt` di schema users
- Status: `paid` atau `unpaid`
- Timestamp `paidAt` untuk mencatat kapan pembayaran dilakukan

### 2. Payment Filter
Tiga filter untuk melihat pemain berdasarkan status pembayaran:
- **Semua**: Menampilkan semua pemain
- **Paid**: Hanya pemain yang sudah bayar
- **Unpaid**: Hanya pemain yang belum bayar

### 3. Bulk Selection
- Checkbox di setiap baris pemain untuk memilih
- Checkbox "Select All" di header tabel
- Visual indicator (background biru) untuk baris yang dipilih

### 4. Payment Action Bar
Muncul ketika ada pemain yang dipilih, dengan opsi:
- **Tandai PAID**: Menandai pemain terpilih sebagai sudah bayar
- **Tandai UNPAID**: Menandai pemain terpilih sebagai belum bayar
- **Batal**: Membatalkan seleksi

### 5. Payment Status Column
Kolom baru di tabel yang menampilkan:
- Badge **PAID** (hijau) dengan icon CheckCircle
- Badge **UNPAID** (orange) dengan icon XCircle
- Tanggal pembayaran (jika sudah paid)

### 6. Excel Export Enhancement
Export Excel sekarang mencakup:
- Kolom "Status Pembayaran" (PAID/UNPAID)
- Kolom "Tanggal Bayar"

### 7. Toast Notifications
Semua notifikasi menggunakan toast (bukan browser alert):
- Success toast untuk operasi berhasil
- Warning toast untuk validasi
- Error toast untuk error handling

## Backend Changes

### Schema (convex/schema.ts)
```typescript
paymentStatus: v.optional(v.union(
  v.literal("unpaid"),
  v.literal("paid")
)),
paidAt: v.optional(v.number()),
```

Added index for payment status:
```typescript
.index("by_payment_status", ["paymentStatus"])
```

### New Mutation (convex/users.ts)
```typescript
export const updatePaymentStatus = mutation({
  args: {
    playerIds: v.array(v.id("users")),
    paymentStatus: v.union(v.literal("paid"), v.literal("unpaid")),
  },
  handler: async (ctx, args) => {
    // Updates payment status for multiple players
    // Sets paidAt timestamp when marking as paid
    // Clears paidAt when marking as unpaid
    // Uses ctx.db.patch() to save to database
  },
});
```

### Updated Query (convex/users.ts)
Updated `listAllPlayers` query to include:
- `paymentStatus` field
- `paidAt` field

## Usage Flow

1. **Filter Pemain**: Pilih filter "Paid" atau "Unpaid" untuk melihat pemain berdasarkan status
2. **Pilih Pemain**: Klik checkbox pada pemain yang ingin diupdate
3. **Update Status**: Klik tombol "Tandai PAID" atau "Tandai UNPAID"
4. **Konfirmasi**: Toast notification akan muncul menunjukkan berapa pemain yang berhasil diupdate
5. **Export**: Data payment status juga ter-export ke Excel

## UI Components

### Payment Filter Tabs
- Menampilkan jumlah pemain di setiap kategori
- Visual indicator dengan warna berbeda (merah untuk semua, hijau untuk paid, orange untuk unpaid)

### Payment Action Bar
- Muncul di atas tabel ketika ada seleksi
- Background biru dengan border
- Menampilkan jumlah pemain yang dipilih

### Status Badge
- **PAID**: Background hijau dengan border, icon CheckCircle
- **UNPAID**: Background orange dengan border, icon XCircle
- Tanggal pembayaran ditampilkan di bawah badge PAID

## Toast Notifications
Menggunakan `useToast` hook dari `ToastContainer`:
- **Success**: Operasi berhasil (hijau)
- **Warning**: Validasi atau peringatan (kuning)
- **Error**: Error handling (merah)

## Database Persistence
- Semua perubahan payment status disimpan ke Convex database menggunakan `ctx.db.patch()`
- Field `paymentStatus` dan `paidAt` tersimpan di tabel `users`
- Data persisten dan dapat diakses kembali setelah refresh

## Notes
- Payment status default adalah `unpaid` jika tidak diset
- Ketika filter berubah, seleksi checkbox akan di-reset
- Pagination tetap berfungsi dengan filter payment
- Search query juga bekerja bersamaan dengan payment filter
- Semua notifikasi menggunakan toast, tidak ada browser alert
- Data payment status tersimpan permanen di database Convex
