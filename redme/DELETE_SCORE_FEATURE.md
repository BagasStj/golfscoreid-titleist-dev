# Delete Score Feature

## Overview
Added the ability for players to delete their scores if they made a mistake during input. This feature is only available for scores that haven't been approved yet.

## Key Features

### 1. Delete Score Mutation (Backend)
- New mutation `deleteScore` in `convex/scores.ts`
- Authorization: Players can only delete their own scores
- Validates score ownership before deletion

### 2. Delete Button in Scoring Interface
- Only visible when editing an existing score (Edit Mode)
- Red button with trash icon below the Update Score button
- Opens confirmation dialog before deletion

### 3. Confirmation Dialog
- Prevents accidental deletions
- Shows hole number and current score
- Two options: Cancel or Confirm Delete
- Loading state during deletion

## Technical Implementation

### Backend (convex/scores.ts)
```typescript
export const deleteScore = mutation({
  args: {
    scoreId: v.id("scores"),
    playerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const score = await ctx.db.get(args.scoreId);
    if (!score) {
      throw new Error("Score not found");
    }
    
    // Authorization check
    if (score.playerId !== args.playerId) {
      throw new Error("Authorization Error: You can only delete your own scores");
    }
    
    await ctx.db.delete(args.scoreId);
    return { success: true };
  },
});
```

### Frontend (ModernScoringInterface.tsx)

**State Management:**
```typescript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
```

**Delete Mutation Hook:**
```typescript
const { mutate: deleteScoreMutation } = useRetryMutation(
  api.scores.deleteScore,
  {
    maxRetries: 3,
    onSuccess: () => {
      showSuccess('Score deleted! 🗑️', 1000);
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete score');
    },
  }
);
```

**Delete Handler:**
```typescript
const handleDelete = async () => {
  if (!existingScore || !user) return;
  
  setIsSubmitting(true);
  try {
    await deleteScoreMutation({
      scoreId: existingScore._id,
      playerId: user._id as Id<'users'>,
    });
    
    setTimeout(() => {
      navigate(`/player/flight-scoring/${id}`);
    }, 800);
  } catch (error) {
    console.error('Delete error:', error);
  } finally {
    setIsSubmitting(false);
    setShowDeleteConfirm(false);
  }
};
```

## User Flow

### Scenario: Player Wants to Delete a Score

1. Player navigates to scoring interface for a hole with existing score
2. Interface shows "Edit Mode" with current score
3. Player sees "Delete Score" button (red) below "Update Score" button
4. Player clicks "Delete Score"
5. Confirmation dialog appears:
   - Title: "Hapus Skor?"
   - Message: "Apakah Anda yakin ingin menghapus skor untuk Hole X?"
   - Shows current score info
   - Two buttons: "Batal" (Cancel) and "Hapus" (Delete)
6. Player clicks "Hapus"
7. Score is deleted from database
8. Success toast: "Score deleted! 🗑️"
9. Player is redirected back to FlightScoringOverview
10. Hole now shows as unscored (can be scored again)

## UI Components

### Delete Button
- Only visible in Edit Mode (`isEditMode === true`)
- Red gradient background (from-red-900 to-red-950)
- Trash icon from lucide-react
- Full width below Update Score button
- Disabled during submission

### Confirmation Dialog
- Dark themed modal with backdrop blur
- Red accent colors (border, icon background)
- Trash icon in red circle
- Score information display
- Two-button layout (Cancel + Delete)
- Loading state on Delete button during submission

## Security & Validation

1. **Authorization**: Players can only delete their own scores
2. **Validation**: Checks if score exists before deletion
3. **Confirmation**: Requires explicit confirmation to prevent accidents
4. **Error Handling**: Shows error toast if deletion fails
5. **Retry Logic**: Uses retry mutation with 3 attempts

## Benefits

1. **Error Correction**: Players can fix input mistakes
2. **User-Friendly**: Clear confirmation prevents accidents
3. **Secure**: Authorization ensures players only delete own scores
4. **Feedback**: Toast notifications confirm successful deletion
5. **Seamless**: Redirects back to overview after deletion

## Limitations

1. Cannot delete approved scores (locked after approval)
2. Only available in Edit Mode (when score exists)
3. Requires confirmation (cannot be undone)

## Future Enhancements

1. Add admin override to delete any score
2. Add score history/audit log
3. Add "undo" feature for recent deletions
4. Batch delete multiple scores at once
