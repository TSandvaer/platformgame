# Game Controls

## Player Movement Controls

### Basic Movement
| Control | Action | Details |
|---------|--------|---------|
| A / ← | Move Left | Walk left at normal speed |
| D / → | Move Right | Walk right at normal speed |
| W / ↑ | Jump | Single jump with gravity |
| S / ↓ | Crouch/Drop | Crouch or drop through platforms |

### Advanced Movement
| Control | Action | Details |
|---------|--------|---------|
| Space | Jump | Alternative jump button |
| Shift + Move | Run | Increased movement speed |
| Space (in air) | Double Jump | Second jump while airborne |
| S (on platform) | Drop Through | Fall through one-way platforms |

### Combat Controls
| Control | Action | Details |
|---------|--------|---------|
| Left Click | Attack | Melee attack in mouse direction |
| Hold Ctrl | Block | Defensive stance (if equipped) |
| Q | Quick Attack | Fast attack combo |
| E | Interact | Open chests, read signs |

## Editor Controls (Development Mode)

### Mode Toggle
| Control | Action |
|---------|--------|
| Tab | Toggle Development Mode |

### Camera Controls
| Control | Action | Details |
|---------|--------|---------|
| Mouse to Edge | Pan Camera | Move camera by hovering at screen edges |
| Right Click + Drag | Manual Pan | Drag to move camera freely |
| Middle Click + Drag | Alternative Pan | Another way to pan camera |
| Scroll Wheel | Zoom | Zoom in/out (if supported) |
| F | Free Camera | Toggle free camera mode |
| C | Center on Player | Return camera to player |

### Selection Controls
| Control | Action | Details |
|---------|--------|---------|
| Left Click | Select | Select single object |
| Ctrl + Click | Multi-Select | Add/remove from selection |
| Shift + Click | Range Select | Select range of objects |
| Click + Drag | Box Select | Draw selection box |
| Ctrl + A | Select All | Select all objects of current type |
| Escape | Deselect | Clear selection |

### Editing Controls
| Control | Action | Details |
|---------|--------|---------|
| Delete | Delete | Remove selected objects |
| Backspace | Alternative Delete | Also removes objects |
| Ctrl + C | Copy | Copy selected objects |
| Ctrl + V | Paste | Paste at mouse position |
| Ctrl + X | Cut | Cut selected objects |
| Ctrl + Z | Undo | Undo last action |
| Ctrl + Y | Redo | Redo undone action |
| Ctrl + S | Save | Save current scene |

### Object Manipulation
| Control | Action | Details |
|---------|--------|---------|
| Click + Drag | Move | Move selected objects |
| Arrow Keys | Nudge | Move by 1 pixel |
| Shift + Arrows | Fast Nudge | Move by 10 pixels |
| R | Rotate | Rotate selected objects |
| X | Damage/Destroy | Damage destroyable props |
| H | Toggle Visibility | Hide/show objects |

### Platform-Specific Controls
| Control | Action | Details |
|---------|--------|---------|
| P | Platform Mode | Toggle platform placement |
| Shift + Drag | Snap Line | Snap movement zone to H/V |
| Drag Handles | Adjust Zone | Modify movement paths |

### Prop-Specific Controls
| Control | Action | Details |
|---------|--------|---------|
| Click Modal | Open Props Editor | Access props selection |
| Number Keys | Quick Select | Select prop category |
| Click Thumbnail | Select Prop | Choose prop to place |

### Enemy-Specific Controls
| Control | Action | Details |
|---------|--------|---------|
| Dropdown | Select Type | Choose enemy type |
| Click | Place Enemy | Add enemy at position |
| Delete | Remove Enemy | Delete selected enemies |

### Scene Controls
| Control | Action | Details |
|---------|--------|---------|
| Ctrl + N | New Scene | Create new scene |
| Ctrl + D | Duplicate Scene | Copy current scene |
| Click Scene | Switch Scene | Load different scene |

## Mouse Controls

### In-Game (Production Mode)
| Button | Action | Details |
|--------|--------|---------|
| Left Click | Attack | Attack toward mouse |
| Right Click | (Reserved) | Future features |
| Middle Click | (Reserved) | Future features |

### In Editor (Development Mode)
| Button | Action | Details |
|--------|--------|---------|
| Left Click | Select/Place | Primary interaction |
| Right Click | Camera Pan | Drag to move view |
| Middle Click | Alt Pan | Alternative camera control |
| Scroll Up | Zoom In | Closer view |
| Scroll Down | Zoom Out | Wider view |

### Drag Operations
| Operation | How To | Result |
|-----------|--------|--------|
| Move Object | Click + Drag | Reposition object |
| Box Select | Click + Drag (empty) | Select multiple |
| Draw Zone | Click + Drag (platform) | Create movement path |
| Pan Camera | Right Click + Drag | Move viewport |
| Resize | Drag Corner/Edge | Change object size |

## Context-Sensitive Controls

### Near Chest
| Control | Action |
|---------|--------|
| E | Open/Close Chest |
| E (open chest) | View Inventory |

### On Moving Platform
| Control | Action |
|---------|--------|
| Movement Keys | Normal movement + platform velocity |
| Jump | Jump with platform momentum |

### In Inventory Modal
| Control | Action |
|---------|--------|
| Click Item | Select/Move item |
| Drag Item | Transfer between inventories |
| Escape | Close inventory |

### In Props/Lootables Editor
| Control | Action |
|---------|--------|
| Click Category | Switch category |
| Click Thumbnail | Select item |
| Configure + Add | Set properties and place |
| Escape | Close modal |

## Quick Reference Card

### Essential Shortcuts
```
Movement: WASD or Arrow Keys
Jump: W or Space
Attack: Left Click
Editor: Tab
Save: Ctrl+S
Copy: Ctrl+C
Paste: Ctrl+V
Delete: Delete
Select All: Ctrl+A
```

### Editor Workflow
```
1. Tab - Enter editor
2. Click button - Select mode
3. Click world - Place object
4. Click object - Select it
5. Edit properties - Modify
6. Ctrl+S - Save
7. Tab - Test play
```

### Combat Combo
```
Click - Basic attack
Click-Click-Click - Combo
Hold Ctrl - Block
E - Interact with objects
```

## Control Customization

### Supported Customizations
- Key rebinding (future feature)
- Mouse sensitivity
- Camera speed
- Zoom levels

### Accessibility Options
- Alternative key mappings
- Hold-to-run toggle
- Auto-jump option
- Camera shake toggle

## Platform-Specific Notes

### Windows
- All controls work as listed
- Use Ctrl for modifier key

### Mac
- Use Cmd instead of Ctrl
- Two-finger scroll for zoom
- Option+Click for right-click

### Linux
- Standard controls apply
- Ensure browser has focus
- Middle-click might be intercepted

## Troubleshooting Controls

### Keys Not Working
1. Click on game canvas to focus
2. Check browser doesn't override keys
3. Disable browser extensions
4. Try different browser

### Mouse Issues
1. Ensure pointer lock if enabled
2. Check mouse sensitivity settings
3. Disable mouse acceleration
4. Update browser

### Performance Impact
- Complex controls may lag on slow systems
- Reduce visual effects for better response
- Close other browser tabs
- Update graphics drivers

---

Next: [Combat System](./02-combat.md) →