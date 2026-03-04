# Perbaikan Masalah Access Denied untuk Admin

## Masalah
Ketika login dengan role admin dari data di Convex, user masih mendapatkan "Access Denied" saat mengakses halaman Admin Dashboard.

## Penyebab
Komponen-komponen berikut menggunakan `useQuery(api.users.getCurrentUser)` yang memerlukan Convex authentication:
- `AdminDashboard.tsx`
- `PlayerDashboard.tsx`
- `AdminLayout.tsx`
- `PlayerLayout.tsx`

Query `getCurrentUser` di Convex memerlukan `ctx.auth.getUserIdentity()` yang tidak tersedia karena aplikasi menggunakan sistem login berbasis localStorage, bukan Convex Auth.

## Solusi
Mengganti penggunaan `useQuery(api.users.getCurrentUser)` dengan `useAuth()` hook yang mengambil data user dari localStorage:

### File yang Diperbaiki:

1. **src/components/admin/AdminDashboard.tsx**
   - Mengganti `const currentUser = useQuery(api.users.getCurrentUser)` 
   - Menjadi `const { user: currentUser, logout, isLoading: authLoading } = useAuth()`
   - Menambahkan debug logging untuk membantu troubleshooting

2. **src/components/player/PlayerDashboard.tsx**
   - Mengganti `const currentUser = useQuery(api.users.getCurrentUser)`
   - Menjadi `const { user: currentUser, logout } = useAuth()`
   - Memperbaiki referensi `user` menjadi `currentUser`

3. **src/components/admin/AdminLayout.tsx**
   - Menambahkan import `useAuth`
   - Mengganti query dengan `const { user: currentUser, isLoading: authLoading } = useAuth()`

4. **src/components/player/PlayerLayout.tsx**
   - Menghapus import `useQuery` dan `api`
   - Menambahkan import `useAuth`
   - Mengganti query dengan `const { user: currentUser, isLoading } = useAuth()`

## Hasil
Sekarang ketika user login sebagai admin:
1. Data user disimpan di localStorage melalui `AuthContext`
2. Komponen mengambil data user dari `useAuth()` hook
3. Role admin terdeteksi dengan benar
4. User dapat mengakses Admin Dashboard tanpa "Access Denied"

## Testing
Untuk menguji perbaikan:
1. Login menggunakan kredensial admin dari Convex database
2. Setelah login, user akan diarahkan ke `/admin`
3. Admin Dashboard akan menampilkan data dengan benar
4. Console browser akan menampilkan debug log yang menunjukkan user role

## Debug Logging
AdminDashboard sekarang memiliki console logging untuk membantu troubleshooting:
```
🔍 AdminDashboard State
Auth Loading: false
Current User: { _id: "...", name: "...", role: "admin", ... }
User Role: admin
```
