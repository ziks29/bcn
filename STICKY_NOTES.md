# Sticky Notes Feature

## Overview

The Sticky Notes feature in BCN uses a **hybrid storage model** that provides the best of both worlds:

- **User-specific data**: Syncs across all devices (stored in database)
  - Note content
  - Note title
  - Note color
  - Categories
  - Reminder dates
  - Creation/update timestamps

- **Device-specific data**: Unique per device (stored in localStorage)
  - Note positions (X, Y coordinates)
  - Note sizes (width, height)
  - Visibility (which notes are shown/hidden on the canvas)

## Why This Design?

### The Problem
Different devices have different screen sizes and resolutions:
- A note positioned at coordinates (1000, 500) might be perfect on a 1920x1080 monitor
- But the same coordinates would be off-screen on a 1366x768 laptop
- Users might want to arrange notes differently on their work desktop vs home laptop

### The Solution
By storing positions locally:
- Users can arrange notes optimally for each device
- Notes automatically adapt to different screen sizes
- Content stays synchronized across all devices
- Each user's personal workspace is preserved

## How It Works

### When You Create a Note
1. Note content is saved to the database (with your userId)
2. Note position is saved to localStorage on your current device
3. The note appears at the same position only on this device

### When You Move a Note
1. The new position is saved to localStorage
2. No database update is made
3. Other devices are not affected

### When You Edit a Note
1. Content changes are saved to the database
2. Changes sync to all your devices
3. Position remains device-specific

### When You Use Multiple Devices
1. Login to BCN on Device A and Device B
2. Create a note on Device A at position (100, 100)
3. The note appears on Device B at its default position (from database)
4. Move the note on Device B to position (500, 500)
5. Device A still shows it at (100, 100) - each device has its own layout
6. Edit the note content on Device A
7. The content update appears on Device B (but position stays at 500, 500)

## Testing the Feature

### Test 1: Basic Functionality
1. Login to the admin panel
2. Click the Notes button
3. Create a new sticky note
4. Add some content and move it around
5. Close the notes panel and reopen it
6. Verify the note appears at the same position

### Test 2: Content Synchronization
1. Open the app in two different browsers (Chrome and Firefox)
2. Login with the same user account
3. Create a note in Chrome
4. Verify it appears in Firefox
5. Edit the note content in Firefox
6. Verify the changes appear in Chrome
7. Move the note in Chrome
8. Verify the position in Firefox is unchanged

### Test 3: Device-Specific Positions
1. Open the app on two devices (desktop and laptop/tablet)
2. Login with the same user account
3. Arrange notes on your desktop
4. Check the laptop/tablet - notes appear but at default positions
5. Arrange notes on the laptop/tablet
6. Check the desktop - original arrangement is preserved

### Test 4: Visibility State
1. Create several notes
2. Close/hide some notes using the X button
3. Close and reopen the notes panel
4. Verify hidden notes remain hidden
5. Use the "All Notes" list to show hidden notes again

## Technical Details

### LocalStorage Keys
- `notePositions`: JSON object mapping note IDs to {posX, posY, width, height}
- `closedNotes`: JSON array of note IDs that are hidden on this device

### Data Flow
```
User creates note
    ├─> Database: Save content, color, category, userId
    └─> LocalStorage: Save position, size

User moves note
    └─> LocalStorage: Update position

User edits note
    ├─> Database: Update content, color, category
    └─> LocalStorage: No change (position preserved)

User loads notes
    ├─> Database: Fetch all notes for userId
    └─> LocalStorage: Override positions with device-specific values
```

### Component Architecture
- **NotesProvider**: Manages note count and panel open/close state
- **NotesPanel**: Main component handling note CRUD and localStorage
- **StickyNote**: Individual note component with drag/resize/edit

### Server Actions
- `getNotes()`: Fetch notes from database (filtered by userId)
- `createNote()`: Create new note in database
- `updateNote()`: Update note content in database
- `deleteNote()`: Delete note from database
- ~~`updateNotePosition()`~~: Removed (now handled by localStorage)
- ~~`updateNoteSize()`~~: Removed (now handled by localStorage)

## Browser Compatibility

This feature requires:
- localStorage support (available in all modern browsers)
- ES6 JavaScript support
- React hooks

## Privacy & Security

- Note content is stored server-side with authentication
- Only the note owner (userId) can access their notes
- LocalStorage data is browser-specific and cannot be accessed by other users
- Clearing browser data will reset note positions to defaults

## Migration Notes

For existing notes created before this change:
- Content and properties remain unchanged
- Positions will use database values on first load
- As soon as a note is moved, the new position is saved to localStorage
- Database positions are no longer updated but remain as fallback defaults
