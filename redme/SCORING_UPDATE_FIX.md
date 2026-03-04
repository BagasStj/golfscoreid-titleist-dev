# Fix: Update Score pada Hole yang Sudah Diisi

## Masalah
Player tidak bisa mengupdate score pada hole yang sudah diisi karena hole tersebut tidak bisa diakses lagi setelah scoring.

## Solusi yang Diterapkan

### 1. Perubahan pada ModernScoringInterface.tsx

#### A. Menampilkan Semua Hole (Bukan Hanya yang Belum Diisi)
**Sebelum:**
```typescript
const unscoredHoles = holesConfig.filter(h => !scoredHoles.has(h.holeNumber));
const currentHole = unscoredHoles[currentHoleIndex];
```

**Sesudah:**
```typescript
const currentHole = holesConfig[currentHoleIndex];
const existingScore = currentHole ? scoredHolesMap.get(currentHole.holeNumber) : null;
const isEditMode = !!existingScore;
```

#### B. Menambahkan Update Score Mutation
```typescript
const { mutate: updateScoreMutation } = useRetryMutation(
  api.scores.updateScore,
  {
    maxRetries: 3,
    onSuccess: () => {
      showSuccess('Score updated! ✅');
    },
    onError: (error) => {
      showError(error.message || 'Failed to update score');
    },
  }
);
```

#### C. Handle Submit untuk New Score dan Update Score
```typescript
const handleSubmit = async () => {
  if (isEditMode && existingScore) {
    // Update existing score
    await updateScoreMutation({
      scoreId: existingScore._id,
      playerId: user._id,
      newStrokes: strokes,
    });
  } else {
    // Submit new score
    await submitScoreMutation({...});
  }
};
```

#### D. UI Improvements

1. **Hole Navigation Grid:**
   - Hole yang sudah diisi ditampilkan dengan warna biru
   - Menampilkan score di pojok kanan bawah hole yang sudah diisi
   - Semua hole bisa diklik (tidak disabled)

2. **Edit Mode Indicator:**
   - Badge "✏️ Edit Mode" muncul saat mengedit hole yang sudah diisi
   - Menampilkan "Previous: X strokes" di bawah hole info

3. **Button Text:**
   - "Submit Score" untuk hole baru
   - "Update Score" untuk hole yang sudah diisi
   - Warna button berubah (hijau untuk submit, biru untuk update)

4. **Auto-fill Score:**
   - Hole baru: diisi dengan par
   - Hole yang sudah diisi: diisi dengan score sebelumnya

## Fitur Baru

### 1. Edit Mode
- Player bisa klik hole yang sudah diisi untuk mengeditnya
- Score sebelumnya ditampilkan sebagai referensi
- Visual indicator yang jelas (badge biru "Edit Mode")

### 2. Visual Feedback
- Hole yang sudah diisi: background biru dengan score di pojok
- Hole yang belum diisi: background putih
- Hole yang sedang aktif: background hijau dengan ring

### 3. Navigation
- Bisa navigasi ke hole manapun (prev/next)
- Tidak terbatas hanya pada hole yang belum diisi

## Backend Support
Backend sudah mendukung update score melalui mutation `updateScore`:
- Validasi authorization (player hanya bisa update score sendiri)
- Update timestamp saat score diupdate
- Error handling yang proper

## Testing
Untuk test fitur ini:
1. Login sebagai player
2. Pilih tournament dan mulai scoring
3. Isi beberapa hole
4. Klik hole yang sudah diisi
5. Ubah scorenya
6. Klik "Update Score"
7. Verifikasi score berubah di scorecard dan leaderboard

## Catatan
- Semua hole sekarang bisa diakses kapan saja
- Player bisa mengupdate score berkali-kali
- Timestamp akan diupdate setiap kali score diubah
