# Props Editor Guide

## Overview

The Props Editor provides a visual, grid-based interface for placing decorative and interactive objects in your scenes. With over 50 different props organized by category, you can create rich, detailed environments.

## Accessing the Props Editor

### Opening the Modal
1. In Development Mode (press Tab)
2. Click "Open Props Editor" button
3. Modal window appears with prop grid

### Props Editor Interface

```
┌─────────────────────────────────────────┐
│         Props Editor                    │
├─────────────────────────────────────────┤
│ Categories:                             │
│ [Buildings][Nature][Structures][Items]  │
├─────────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│ │    │ │    │ │    │ │    │ │    │   │
│ │ 🏠 │ │ 🏰 │ │ ⛪ │ │ 🏚️ │ │ 🗼 │   │
│ │    │ │    │ │    │ │    │ │    │   │
│ └────┘ └────┘ └────┘ └────┘ └────┘   │
│  House  Tower Church  Ruins  Castle    │
├─────────────────────────────────────────┤
│ Configuration:                          │
│ ├── Obstacle: [✓]                      │
│ ├── Size: [1.0x]                       │
│ ├── Damage: [0] DPS                    │
│ ├── Destroyable: [ ]                   │
│ └── Max Durability: [100]              │
├─────────────────────────────────────────┤
│ [Add Prop] [Close]                      │
└─────────────────────────────────────────┘
```

## Prop Categories

### 1. Buildings (10 props)
- **House**: Basic residential building
- **Tower**: Tall defensive structure
- **Windmill**: Rotating windmill
- **Church**: Religious building
- **Castle**: Large fortress
- **Ruins**: Destroyed structures
- **Hut**: Small dwelling
- **Barn**: Farm storage
- **Shop**: Commercial building
- **Inn**: Traveler's rest

### 2. Nature (15 props)
- **Trees**: Oak, pine, willow, dead
- **Rocks**: Boulder, stones, cliff
- **Plants**: Bush, flowers, grass
- **Mushrooms**: Various sizes
- **Logs**: Fallen trees
- **Stumps**: Cut trees

### 3. Structures (10 props)
- **Banner Pole**: Decorative flag
- **Pole Barrier**: Blocking fence
- **Wooden Pole**: Vertical post
- **Wooden Pole Arm**: Horizontal beam
- **Bridge**: Crossing structure
- **Ladder**: Climbing prop
- **Scaffold**: Construction platform
- **Gate**: Entry/exit point

### 4. Decorations (8 props)
- **Torch**: Light source
- **Lantern**: Hanging light
- **Barrel**: Storage container
- **Crate**: Wooden box
- **Sign**: Information display
- **Flag**: Waving banner
- **Statue**: Stone figure
- **Fountain**: Water feature

### 5. Items (5 props)
- **Chest**: Treasure container
- **Key**: Unlocking item
- **Potion**: Health restore
- **Sword**: Weapon display
- **Shield**: Defense item

### 6. Furniture (4 props)
- **Table**: Flat surface
- **Chair**: Seating
- **Bed**: Resting place
- **Bookshelf**: Storage

### 7. Farm (4 props)
- **Fence**: Boundary marker
- **Hay Bale**: Farm storage
- **Scarecrow**: Crop protector
- **Well**: Water source

### 8. Graveyard (3 props)
- **Gravestone1**: Small marker
- **Gravestone2**: Large stone
- **Cross**: Memorial marker

### 9. Cave (3 props)
- **Stalactite**: Ceiling formation
- **Stalagmite**: Floor formation
- **Crystal**: Glowing mineral

### 10. Effects (2 props)
- **Fire**: Burning effect
- **Smoke**: Smoke particles

## Prop Configuration

### Basic Properties

1. **Is Obstacle**
   - When checked: Blocks player/enemy movement
   - When unchecked: Purely decorative

2. **Size Multiplier**
   - Range: 0.5x to 3.0x
   - Default: 1.0x
   - Affects visual and collision size

3. **Damage Per Second**
   - Range: 0 to 100
   - 0: No damage
   - Applied when player touches

### Destroyable Properties

1. **Destroyable Checkbox**
   - Enable: Prop can be destroyed
   - Disable: Prop is indestructible

2. **Max Durability**
   - Range: 1 to 1000
   - Default: 100
   - Health points before destruction

## Placing Props

### Single Placement
1. Select category tab
2. Click prop thumbnail
3. Configure properties
4. Click "Add Prop"
5. Click in game world to place

### Multiple Placement
1. Configure once
2. Click "Add Prop"
3. Click multiple times to place
4. Each click places a new instance

### Placement Modes
- **Free Placement**: Click anywhere
- **Grid Snap**: Hold Ctrl for alignment
- **Rotation**: Use R key after placing

## Managing Placed Props

### Selection
- **Single Click**: Select one prop
- **Ctrl+Click**: Add to selection
- **Box Select**: Drag to select multiple
- **Select All**: Ctrl+A

### Manipulation
- **Move**: Drag selected props
- **Copy**: Ctrl+C
- **Paste**: Ctrl+V at mouse
- **Delete**: Delete key
- **Damage**: X key (if destroyable)

### Property Editing
```
Selected Prop Properties
├── ID: prop_123
├── Type: house
├── Position
│   ├── X: [250]
│   └── Y: [400]
├── Size: [1.5]
├── Obstacle: [✓]
├── Damage: [0]
├── Destroyable: [ ]
└── Current Durability: [100/100]
```

## Advanced Features

### Prop Binding to Moving Platforms

Props automatically bind to platforms when placed on them:

#### Automatic Binding Process
1. **Detection**: Prop detects platform underneath
2. **Binding**: Establishes parent-child relationship
3. **Movement**: Prop maintains relative position to platform
4. **Rotation**: If platform spins, prop rotates with it

#### Binding Behavior
```javascript
{
    prop: {
        x: 150,  // World position
        y: 180,
        boundToPlatform: platform_45
    },
    relativeOffset: {
        x: 50,   // Offset from platform center
        y: -20   // Above platform surface
    }
}
```

#### Movement Inheritance
- **Translation**: Prop moves with platform along path
- **Rotation**: Prop orbits if platform spins
- **Velocity**: Prop inherits platform speed
- **Delays**: Prop stops when platform delays

#### Common Bound Prop Patterns

**Moving Castle:**
```
Platform: Large moving platform
Props: Castle, towers, flags, torches
Effect: Entire castle structure moves as one
```

**Rotating Windmill:**
```
Platform: Spinning platform (invisible)
Props: Windmill center, blades
Effect: Realistic windmill rotation
```

**Decorated Elevator:**
```
Platform: Vertical moving platform
Props: Railings, control panel, lights
Effect: Complete elevator with details
```

**Floating Island:**
```
Platform: Slow horizontal mover
Props: Trees, houses, fences
Effect: Populated island drifting through sky
```

### Spinning Props

Some props have built-in rotation animations:

#### Auto-Rotating Props
- **Windmill**: Continuous blade rotation
- **Water Wheel**: Steady rotation
- **Gears**: Mechanical rotation
- **Fans**: Spinning blades

These props spin independently of platforms and are visual only.

### Prop Groups
Manage multiple props as a unit:

1. Select multiple props
2. Right-click → "Group Props"
3. Groups move/copy together
4. Ungroup to edit individually

### Layering
Control visual depth:

1. **Background**: Behind player
2. **Midground**: Same as player
3. **Foreground**: In front of player

For comprehensive movement details, see the [Advanced Movement Guide](./advanced-movement-guide.md)

## Visual Effects

### Damage States
Props show visual damage:
- **100-75%**: Normal appearance
- **74-50%**: Slightly damaged
- **49-25%**: Heavily damaged
- **24-1%**: Critical damage
- **0%**: Destroyed (removed)

### Particle Effects
Destroyed props create particles:
- Wood props: Brown splinters
- Stone props: Gray debris
- Metal props: Sparks
- Nature props: Leaves

## Best Practices

### Scene Composition

1. **Layering**: Use foreground/background
2. **Clustering**: Group related props
3. **Spacing**: Avoid overcrowding
4. **Variety**: Mix different categories
5. **Scale**: Vary sizes for depth

### Performance Tips

1. **Prop Limits**: ~200 props per scene
2. **Optimize Obstacles**: Limit collision props
3. **Particle Control**: Limit destroyable props
4. **Sprite Efficiency**: Reuse same types

### Common Patterns

#### Village Scene
```
Props Used:
- Houses (varied sizes)
- Trees (surrounding)
- Fences (boundaries)
- Torches (lighting)
- Barrels/Crates (details)
```

#### Forest Scene
```
Props Used:
- Trees (dense placement)
- Rocks (obstacles)
- Mushrooms (decoration)
- Logs (platforms)
- Bushes (hiding spots)
```

#### Dungeon Scene
```
Props Used:
- Torches (lighting)
- Barrels (storage)
- Chains (decoration)
- Skulls (atmosphere)
- Crystals (valuable)
```

## Tips and Tricks

### Quick Duplication
1. Select prop(s)
2. Ctrl+C to copy
3. Ctrl+V repeatedly
4. Each paste offsets slightly

### Alignment Techniques
- Use grid snap (Ctrl)
- Align to platforms
- Create rows/columns
- Use visual guides

### Destroyable Puzzles
Create breakable barriers:
1. Place destroyable props
2. Set low durability
3. Player must break through
4. Hide rewards behind

## Troubleshooting

### Prop Not Appearing
- Check placement position
- Verify scene boundaries
- Ensure not behind background

### Can't Select Prop
- Check if behind other objects
- Try box selection
- Use prop list to select

### Performance Issues
- Reduce prop count
- Disable particles
- Use simpler props
- Check for duplicates

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| P | Open Props Editor |
| Delete | Delete selected props |
| X | Damage selected props |
| R | Rotate selected props |
| Arrows | Nudge props |
| Shift+Arrows | Nudge by 10px |
| Ctrl+C | Copy props |
| Ctrl+V | Paste props |
| Ctrl+A | Select all props |
| Escape | Deselect props |

---

Next: [Enemy Editor](./05-enemy-editor.md) →