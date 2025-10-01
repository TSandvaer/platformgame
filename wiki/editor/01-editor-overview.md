# Game Editor Overview

## Introduction

The Platform RPG Game includes a fully integrated level editor that allows you to create, modify, and test game levels in real-time. The editor operates seamlessly within the game, allowing instant switching between editing and playing.

## Accessing the Editor

### Toggle Development Mode
- **Enter Editor**: Press `Tab` key during gameplay
- **Exit Editor**: Press `Tab` key again to return to play mode
- **Visual Indicator**: Dashboard appears on the right side when in editor mode

## Editor Interface

### Main Dashboard
The editor dashboard is divided into several sections:

```
┌─────────────────────┐
│   DEVELOPMENT MODE  │
├─────────────────────┤
│  Camera Controls    │
│  - Position (X,Y)   │
│  - Mode Toggle      │
├─────────────────────┤
│  Scene Management   │
│  - Current Scene    │
│  - Scene List       │
│  - Add/Delete       │
├─────────────────────┤
│  Platforms          │
│  - List             │
│  - Properties       │
│  - Movement Zones   │
├─────────────────────┤
│  Props              │
│  - Editor Button    │
│  - Selected Props   │
│  - Properties       │
├─────────────────────┤
│  Enemies            │
│  - Type Selector    │
│  - List             │
│  - Properties       │
├─────────────────────┤
│  Lootables          │
│  - Editor Button    │
│  - List             │
│  - Properties       │
├─────────────────────┤
│  Transitions        │
│  - Zone List        │
│  - Add Button       │
└─────────────────────┘
```

## Core Editor Features

### 1. Object Placement
- **Click to Place**: Select object type and click in the game world
- **Drag to Position**: Click and drag objects to move them
- **Grid Snapping**: Optional alignment to grid (hold Ctrl)

### 2. Multi-Selection
- **Box Selection**: Click and drag to select multiple objects
- **Ctrl+Click**: Add/remove individual objects from selection
- **Select All**: Ctrl+A to select all objects of current type

### 3. Copy/Paste System
- **Copy**: Ctrl+C to copy selected objects
- **Paste**: Ctrl+V to paste at mouse position
- **Duplicate**: Quick duplication of configurations

### 4. Property Editing
- **Inspector Panel**: Edit properties of selected objects
- **Real-time Updates**: Changes apply immediately
- **Batch Editing**: Edit multiple selected objects at once

### 5. Visual Feedback
- **Selection Highlights**: Selected objects have colored outlines
- **Hover Effects**: Objects highlight on mouse over
- **Grid Display**: Optional grid overlay for alignment
- **Movement Zones**: Visual representation of platform paths

## Modal Editors

### Props Editor Modal
- **Grid Layout**: Visual thumbnail grid of all props
- **Categories**: Organized by type (Buildings, Nature, etc.)
- **Configuration**: Set properties before placement
- **Preview**: See prop appearance before adding

### Lootables Editor Modal
- **Item Types**: Coins, hearts, gems, etc.
- **Visual Selection**: Click thumbnail to select type
- **Batch Placement**: Place multiple items quickly

## Editor Modes

### 1. **Free Camera Mode**
- Move camera independently of player
- Access entire level for editing
- Scroll to edges for automatic panning

### 2. **Platform Mode**
- Place and edit platforms
- Draw movement zones for moving platforms
- Configure platform properties (damage, effects)

### 3. **Prop Mode**
- Access props editor modal
- Place decorative and interactive props
- Configure destroyability and binding

### 4. **Enemy Mode**
- Select enemy types from dropdown
- Place enemies with click
- Configure AI behaviors

### 5. **Lootable Mode**
- Access lootables editor modal
- Place collectible items
- Configure item values

### 6. **Transition Mode**
- Draw transition zones between scenes
- Configure target scenes and spawn points

## Keyboard Shortcuts

### General
| Shortcut | Action |
|----------|--------|
| Tab | Toggle development mode |
| Ctrl+S | Save current scene |
| Escape | Cancel current operation |
| Delete | Delete selected objects |
| Ctrl+Z | Undo last action |
| Ctrl+Y | Redo last action |

### Selection
| Shortcut | Action |
|----------|--------|
| Ctrl+A | Select all objects |
| Ctrl+Click | Multi-select toggle |
| Shift+Click | Range select |
| Click+Drag | Box selection |

### Editing
| Shortcut | Action |
|----------|--------|
| Ctrl+C | Copy selected |
| Ctrl+V | Paste at mouse |
| Arrow Keys | Nudge selected objects |
| Shift+Arrow | Nudge by 10 pixels |
| X | Damage/destroy props |

### Platform Movement Zones
| Shortcut | Action |
|----------|--------|
| Click+Drag | Draw movement path |
| Shift+Drag | Snap to horizontal/vertical |
| Drag Handle | Adjust zone endpoints |

## Mouse Controls

### Left Click
- Select objects
- Place new objects
- Drag to move
- Access UI buttons

### Right Click
- Pan camera (drag)
- Context menu (when applicable)
- Cancel operations

### Middle Click
- Alternative camera pan
- Quick zoom reset

### Scroll Wheel
- Zoom in/out (when supported)
- Scroll through lists

## Visual Indicators

### Object States
- **White Outline**: Normal object
- **Yellow Outline**: Selected object
- **Red Outline**: Multi-selected object
- **Blue Outline**: Hovering over object
- **Green Outline**: Valid placement
- **Red Tint**: Invalid placement

### Platform Movement
- **Blue Line**: Movement path
- **Circles**: Start/end points
- **Arrow**: Direction of movement
- **Handles**: Draggable adjustment points

## Workflow Tips

### Efficient Level Building
1. **Start with Platforms**: Build the basic level structure
2. **Add Props**: Place decorative elements
3. **Configure Movement**: Set up moving platforms
4. **Place Enemies**: Add challenges
5. **Add Lootables**: Place rewards
6. **Test Frequently**: Switch to play mode often
7. **Save Regularly**: Ctrl+S to save progress

### Best Practices
- **Group Similar Objects**: Work on one type at a time
- **Use Copy/Paste**: Duplicate similar configurations
- **Test Collisions**: Verify platform alignment
- **Check Transitions**: Test scene connections
- **Balance Difficulty**: Playtest enemy placement

## Performance Considerations

### Object Limits
- **Platforms**: ~100 per scene recommended
- **Props**: ~200 per scene recommended
- **Enemies**: ~50 active enemies
- **Particles**: ~1000 simultaneous particles
- **Lootables**: ~100 per scene

### Optimization Tips
- Remove unused objects
- Minimize overlapping sprites
- Use appropriate sprite sizes
- Limit particle effects
- Group nearby props

## Saving and Loading

### Auto-Save
- Changes save to localStorage automatically
- Scene data persists between sessions
- Settings preserved

### Manual Save
- Press Ctrl+S to force save
- Confirmation message appears
- Safe to close browser after

### Data Management
- Each scene saved separately
- Player progress maintained
- Editor settings remembered

---

Next: [Development Mode](./02-development-mode.md) →