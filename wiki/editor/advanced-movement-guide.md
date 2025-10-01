# Advanced Movement and Rotation Guide

## Overview

Both platforms and props can be configured with dynamic movement and rotation behaviors, creating complex interactive environments. This guide covers all movement and spinning features in detail.

## Platform Movement System

### Basic Movement Setup

#### Step 1: Enable Movement
1. Select a platform
2. Check "Moving Platform" checkbox in properties
3. Movement configuration options appear

#### Step 2: Draw Movement Zone
1. Click "Draw Movement Zone" button
2. Click in game world to set start point
3. Drag to define movement path
4. Release to set end point
5. Blue line visualizes the movement path

#### Step 3: Configure Movement
```
Movement Configuration
├── Speed: 1-10 (pixels per frame)
├── Direction: Automatic (back and forth)
├── Progress: 0-1 (position along path)
└── Status: Moving/Paused
```

### Movement Zone Features

#### Visual Indicators
- **Blue Line**: Movement path
- **Green Circle**: Start point
- **Red Circle**: End point
- **Arrows**: Direction of movement
- **Platform Ghost**: Shows target position

#### Editing Movement Zones
1. **Adjust Start Point**
   - Click and drag green circle
   - Platform moves with start point
   - Original position updates

2. **Adjust End Point**
   - Click and drag red circle
   - Only path changes
   - Platform stays at current position

3. **Snap to Grid**
   - Hold Shift while dragging
   - Snaps to horizontal or vertical
   - Perfect straight lines

### Advanced Movement Options

#### Easing System
Creates smooth acceleration/deceleration:

```
Easing Configuration
├── Enable Easing: [checkbox]
├── Easing Distance: 0.1-1.0
│   └── How far from ends to start slowing
├── Min Speed: 0.1-1.0
│   └── Minimum speed multiplier during easing
└── Effect: Natural start/stop motion
```

**Example Settings:**
- **Gentle Stop**: Distance: 0.3, Min: 0.2
- **Sudden Stop**: Distance: 0.1, Min: 0.5
- **Very Smooth**: Distance: 0.5, Min: 0.1

#### End Delays
Pause platform at path endpoints:

```
Delay Configuration
├── End Delay: 0-5000ms
├── Behavior: Platform pauses at each end
└── Use Cases: Elevators, timed challenges
```

**Common Delay Patterns:**
- **No Delay (0ms)**: Continuous movement
- **Brief Pause (500ms)**: Quick stop
- **Standard Wait (1000ms)**: Clear pause
- **Long Wait (3000ms)**: Extended stop

### Movement Patterns

#### Horizontal Movement (Elevator)
```javascript
{
    isMoving: true,
    moveSpeed: 2,
    movementZone: {
        enabled: true,
        startX: 100,
        startY: 300,
        endX: 100,
        endY: 100  // Vertical path
    },
    endDelay: 1000,
    useEasing: true
}
```

#### Patrol Platform
```javascript
{
    isMoving: true,
    moveSpeed: 3,
    movementZone: {
        enabled: true,
        startX: 50,
        startY: 200,
        endX: 350,
        endY: 200  // Horizontal path
    },
    endDelay: 500
}
```

#### Diagonal Mover
```javascript
{
    isMoving: true,
    moveSpeed: 4,
    movementZone: {
        enabled: true,
        startX: 100,
        startY: 100,
        endX: 300,
        endY: 300  // Diagonal path
    }
}
```

## Platform Spinning System

### Enabling Rotation

1. Select platform
2. Check "Spinning Platform" checkbox
3. Configure rotation properties:

```
Spinning Configuration
├── Enable Spinning: [checkbox]
├── Spin Speed: 0.1-5.0 rotations/second
├── Direction: [Clockwise/Counter-clockwise]
└── Current Rotation: 0-360 degrees
```

### Spinning Properties

#### Speed Settings
- **Slow (0.1-0.5)**: Gentle rotation, easy to ride
- **Medium (0.5-2.0)**: Challenging but manageable
- **Fast (2.0-5.0)**: Difficult to stay on

#### Rotation Effects on Player
- Player inherits angular momentum
- Affects jump direction
- Can throw player off if too fast

### Combined Movement and Spinning

Platforms can move AND spin simultaneously:

```javascript
{
    // Movement
    isMoving: true,
    moveSpeed: 2,
    movementZone: { /* path config */ },

    // Spinning
    isSpinning: true,
    spinSpeed: 1.0,
    spinClockwise: true
}
```

**Use Cases:**
- Rotating elevators
- Spinning bridges
- Complex obstacle courses

## Props Bound to Moving Platforms

### Binding Props to Platforms

Props can be attached to platforms to move with them:

1. **Place Prop on Platform**
   - Position prop on platform surface
   - Ensure prop overlaps platform

2. **Enable Binding**
   - Select prop
   - Platform binding auto-detects
   - Prop inherits platform movement

3. **Binding Behavior**
   - Maintains relative position
   - Moves with platform
   - Rotates if platform spins

### Bound Prop Configuration

```javascript
{
    propId: "prop_123",
    x: 150,  // Relative to world
    y: 180,
    boundToPlatform: platform_45,
    relativeOffset: {
        x: 50,   // Offset from platform origin
        y: -20
    }
}
```

### Common Bound Prop Patterns

#### Moving House Platform
```
Platform: Horizontal mover
Props: House, fence, torch
Effect: Entire structure moves together
```

#### Rotating Windmill
```
Platform: Spinning platform
Props: Windmill blades (visual only)
Effect: Realistic windmill rotation
```

#### Elevator with Decorations
```
Platform: Vertical mover with delays
Props: Railings, control panel
Effect: Complete elevator unit
```

## Movement Control Buttons

### Platform Controls
When a moving platform is selected:

```
Movement Controls
├── [Stop/Resume]: Toggle movement pause
├── [Reset Position]: Return to start
└── [Clear Zone]: Remove movement path
```

### Programmatic Control

Movement can be controlled via properties:

```javascript
// Pause movement
platform.isMovementPaused = true;

// Resume movement
platform.isMovementPaused = false;

// Reset to origin
platform.x = platform.originalPosition.x;
platform.y = platform.originalPosition.y;
platform.movementProgress = 0;
```

## Props with Movement Capabilities

### Spinning Props

Certain props have built-in rotation:

#### Windmill
- Auto-rotates when placed
- Fixed rotation speed
- Visual effect only

#### Water Wheel
- Rotates continuously
- Can be decorative or obstacle

### Animated Props

Some props have animation states:

#### Torch/Fire
- Flickering animation
- Particle effects
- No collision impact

#### Flags/Banners
- Waving animation
- Wind effect simulation
- Pure decoration

## Performance Considerations

### Movement Limits
- **Max Moving Platforms**: ~20 per scene
- **Max Spinning Platforms**: ~10 per scene
- **Max Bound Props**: ~50 per scene

### Optimization Tips

1. **Simplify Paths**
   - Use straight lines when possible
   - Avoid complex curves
   - Minimize zone adjustments

2. **Batch Similar Movements**
   - Group platforms with same speed
   - Synchronize delays
   - Use consistent patterns

3. **Limit Combinations**
   - Avoid many spinning + moving platforms
   - Reduce bound props on fast movers
   - Test performance regularly

## Advanced Techniques

### Synchronized Platforms

Create coordinated platform movements:

1. Set identical movement zones
2. Match speeds and delays
3. Offset starting progress

```javascript
// Platform 1
platform1.movementProgress = 0;

// Platform 2 (offset by half)
platform2.movementProgress = 0.5;
```

### Chain Reactions

Link platform movements:

1. Use delays to create sequences
2. Position platforms for transfers
3. Test timing thoroughly

### Puzzle Mechanisms

Use movement for puzzles:

1. **Timed Jumps**: Platforms with specific delays
2. **Rotating Bridges**: Must time crossing
3. **Moving Maze**: Shifting wall platforms

## Troubleshooting

### Platform Not Moving
- Verify "Moving Platform" checked
- Ensure movement zone drawn
- Check speed > 0
- Confirm not paused

### Erratic Movement
- Redraw movement zone
- Check for zone corruption
- Verify start/end points differ
- Reset platform position

### Props Not Following Platform
- Ensure prop overlaps platform
- Check binding is enabled
- Verify platform has ID
- Reload scene if needed

### Performance Issues
- Reduce number of moving platforms
- Simplify movement paths
- Disable unnecessary spinning
- Lower particle effects

## Examples and Templates

### Template: Moving Elevator
```
Type: Moving Platform
Movement: Vertical
Speed: 2
Delay: 1500ms
Easing: Yes (0.3, 0.2)
Props: None
Use: Vertical transportation
```

### Template: Spinning Saw
```
Type: Spinning Platform
Rotation: 3.0 rps
Direction: Clockwise
Damage: 100 DPS
Size: Small (64x64)
Use: Hazard obstacle
```

### Template: Ferry Platform
```
Type: Moving Platform
Movement: Horizontal
Speed: 1.5
Delay: 2000ms
Props: Fence boundaries
Use: Water crossing
```

### Template: Rotating Room
```
Type: Large spinning platform
Rotation: 0.5 rps
Props: All room contents bound
Effect: Entire room rotates
Use: Disorientation puzzle
```

## Best Practices

1. **Test Everything**: Always playtest movements
2. **Start Simple**: Basic movements first
3. **Layer Complexity**: Add features gradually
4. **Consider Players**: Make it fun, not frustrating
5. **Visual Clarity**: Clear movement indicators
6. **Consistent Timing**: Predictable patterns
7. **Emergency Stops**: Provide safe spots

---

Related: [Platform Editor](./03-platform-editor.md) | [Props Editor](./04-props-editor.md) | [Performance Guide](../technical/04-performance.md)