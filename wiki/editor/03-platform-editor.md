# Platform Editor Guide

## Overview

The Platform Editor allows you to create and configure the fundamental traversal elements of your levels. Platforms can be static, moving, spinning, damaging, or blocking, providing diverse gameplay mechanics.

## Platform Types

### 1. Static Platforms
- **Purpose**: Basic traversal and ground
- **Properties**: Position, size, appearance
- **Use Cases**: Ground, ledges, walls

### 2. Moving Platforms
- **Purpose**: Dynamic traversal challenges
- **Properties**: Movement path, speed, delays
- **Use Cases**: Elevators, sliding platforms, ferries

### 3. Spinning Platforms
- **Purpose**: Rotating obstacles or mechanisms
- **Properties**: Rotation speed, direction
- **Use Cases**: Windmills, gears, rotating bridges

### 4. Damaging Platforms
- **Purpose**: Environmental hazards
- **Properties**: Damage per second, kill effect
- **Use Cases**: Spikes, lava, poison floors

### 5. Blocking Platforms
- **Purpose**: Solid obstacles that block from all sides
- **Properties**: Block player flag, damage
- **Use Cases**: Walls, crushing ceilings, barriers

## Creating Platforms

### Basic Placement
1. Click "Toggle Platform Placement" button
2. Click in the game world to place platform
3. Platform appears at mouse position
4. Default size: 150x20 pixels

### Platform Properties Panel

```
Platform Properties
├── Position
│   ├── X: [number input]
│   └── Y: [number input]
├── Size
│   ├── Width: [number input]
│   └── Height: [number input] (max: 32)
├── Appearance
│   └── Sprite Type: [dropdown]
│       ├── Color (solid color)
│       ├── Grass
│       ├── Stone
│       ├── Wood
│       ├── Ice
│       └── Metal
├── Behavior
│   ├── Damage: [0-100] DPS
│   ├── Kill Effect: [Normal/Sink]
│   └── Block Player: [checkbox]
└── Movement
    └── Moving Platform: [checkbox]
```

## Movement System

### Setting Up Moving Platforms

1. **Enable Movement**
   - Select platform
   - Check "Moving Platform" checkbox
   - Movement options appear

2. **Draw Movement Zone**
   - Click "Draw Movement Zone" button
   - Click and drag to define path
   - Blue line shows movement path
   - Platform moves along this line

3. **Configure Movement**
   ```
   Movement Settings
   ├── Speed: [1-10] pixels/frame
   ├── Easing: [checkbox]
   │   ├── Distance: [0.1-1.0]
   │   └── Min Speed: [0.1-1.0]
   └── End Delay: [0-5000] ms
   ```

### Movement Zone Controls

#### Drawing Zones
- **Click**: Start point
- **Drag**: Define path
- **Release**: Set endpoint
- **Shift+Drag**: Snap to horizontal/vertical

#### Editing Zones
- **Drag Handles**: Adjust start/end points
- **Blue Circles**: Visual handles for adjustment
- **Moving Start**: Platform moves with it
- **Moving End**: Only path changes

#### Zone Properties
- **Start Point**: Where platform begins
- **End Point**: Where platform travels to
- **Direction**: Automatic back-and-forth
- **Speed**: How fast platform moves

### Movement Controls

```
Movement Control Buttons
├── Stop/Resume: Pause platform movement
├── Reset Position: Return to start
└── Clear Zone: Remove movement path
```

## Platform Behaviors

### Damage System
Platforms can damage the player:

1. **Damage Per Second (DPS)**
   - 0: No damage
   - 1-25: Light damage
   - 26-50: Moderate damage
   - 51-100: Heavy damage

2. **Kill Effects**
   - **Normal**: Player dies on platform surface
   - **Sink**: Player sinks into platform

### Block Player Feature
When enabled, platform blocks player from all sides:

1. **Collision Behavior**
   - Blocks from top, bottom, left, right
   - Stops platform movement on collision
   - Applies damage if configured

2. **Use Cases**
   - Solid walls
   - Crushing ceilings
   - Moving barriers
   - Puzzle obstacles

## Advanced Features

### Platform Spinning
Configure rotation for platforms:

```
Spinning Settings
├── Enable Spinning: [checkbox]
├── Speed: [0.1-5.0] rotations/second
└── Direction: [Clockwise/Counter-clockwise]
```

**Rotation Speeds:**
- **Slow (0.1-0.5 rps)**: Easy to traverse, gentle rotation
- **Medium (0.5-2.0 rps)**: Challenging but manageable
- **Fast (2.0-5.0 rps)**: Very difficult, throws players off

**Effects on Gameplay:**
- Player inherits angular momentum when standing on platform
- Jump direction affected by rotation
- Can be combined with movement for complex challenges

### Easing Configuration
Smooth movement acceleration/deceleration:

1. **Easing Distance** (0.1-1.0): How far from ends to start slowing
   - 0.1 = Sharp stop (10% of path)
   - 0.3 = Standard easing (30% of path)
   - 0.5 = Very smooth (50% of path)

2. **Min Speed** (0.1-1.0): Minimum speed during easing
   - 0.1 = Very slow at ends (10% speed)
   - 0.2 = Noticeable slowdown (20% speed)
   - 0.5 = Gentle slowdown (50% speed)

3. **Effect**: Creates natural acceleration/deceleration for realistic movement

### Platform Positioning Modes

1. **Absolute**: Fixed world position
2. **Relative**: Relative to screen/viewport
3. **Screen-Relative**: Maintains screen position

### Props Bound to Platforms

Props placed on platforms automatically bind and move with them:

1. **Automatic Binding**: Props detect platform underneath
2. **Relative Position**: Maintains offset from platform
3. **Inheritance**: Props inherit all platform movement and rotation
4. **Use Cases**: Moving structures, decorated platforms, complex mechanisms

For detailed movement configuration, see the [Advanced Movement Guide](./advanced-movement-guide.md)

## Visual Customization

### Sprite Types

| Type | Appearance | Best For |
|------|------------|----------|
| Color | Solid color | Prototyping |
| Grass | Green texture | Natural areas |
| Stone | Gray texture | Caves, castles |
| Wood | Brown texture | Buildings, bridges |
| Ice | Blue texture | Slippery surfaces |
| Metal | Silver texture | Industrial areas |

### Visual Indicators

- **Selected**: Yellow outline
- **Moving**: Animated along path
- **Damaging**: Red tint (optional)
- **Spinning**: Rotation animation

## Tips and Tricks

### Efficient Platform Design

1. **Spacing**: Leave 48-64 pixels for jump height
2. **Width**: Minimum 64 pixels for landing
3. **Groups**: Use copy/paste for patterns
4. **Testing**: Switch modes frequently

### Movement Best Practices

1. **Speed Settings**
   - Slow (1-2): Careful timing
   - Medium (3-4): Standard platforming
   - Fast (5+): Quick reactions

2. **Path Design**
   - Horizontal: Elevators, bridges
   - Vertical: Lifts, pistons
   - Diagonal: Unique challenges

3. **Timing Delays**
   - 0ms: Continuous movement
   - 500-1000ms: Brief pause
   - 2000ms+: Clear waiting period

### Common Patterns

#### Elevator System
```
Settings:
- Vertical movement zone
- Speed: 2
- End Delay: 1000ms
- No damage
```

#### Crushing Ceiling
```
Settings:
- Vertical movement zone
- Speed: 4
- Block Player: true
- Damage: 100 DPS
```

#### Moving Bridge
```
Settings:
- Horizontal movement zone
- Speed: 3
- Easing: enabled
- End Delay: 500ms
```

## Troubleshooting

### Platform Not Moving
- Check "Moving Platform" is enabled
- Verify movement zone is drawn
- Ensure speed > 0
- Check platform not paused

### Player Falls Through
- Verify collision detection
- Check platform height (min 10px)
- Ensure no gaps in platform

### Movement Zone Issues
- Redraw zone if corrupted
- Check start/end points different
- Verify handles are accessible

## Performance Tips

1. **Limit Moving Platforms**: ~20 per scene
2. **Optimize Paths**: Simple lines perform better
3. **Reduce Spinning**: Limit to 5-10 spinning platforms
4. **Test Performance**: Monitor FPS with many platforms

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| P | Toggle platform placement |
| Delete | Delete selected platform |
| Arrows | Nudge platform position |
| Shift+Arrows | Nudge by 10 pixels |
| Ctrl+C | Copy platform |
| Ctrl+V | Paste platform |

---

Next: [Props Editor](./04-props-editor.md) →