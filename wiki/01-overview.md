# Platform RPG Game - Overview

## Introduction

The Platform RPG Game is a web-based 2D platform game engine with an integrated level editor. Built entirely in vanilla JavaScript, it provides a complete game development environment that runs directly in the browser without any build tools or dependencies.

## Core Philosophy

The project follows these key principles:

1. **No Dependencies**: Pure vanilla JavaScript with no external libraries
2. **Integrated Editor**: Seamless switch between playing and editing
3. **Real-time Testing**: Test changes instantly without recompilation
4. **Browser-based**: Runs entirely in the browser using HTML5 Canvas
5. **Local Storage**: All data persists locally in the browser

## Key Features

### 🎮 Game Engine
- **2D Physics Engine**: Custom physics with gravity, collisions, and momentum
- **Sprite-based Rendering**: Efficient sprite rendering with animation support
- **Particle System**: Visual effects for combat, damage, and interactions
- **Audio System**: Sound effects and background music support
- **State Management**: Scene-based state management with transitions

### 🛠️ Level Editor
- **Visual Editing**: Click-and-drag interface for all game elements
- **Real-time Preview**: See changes immediately in the game
- **Multi-selection**: Select and edit multiple objects at once
- **Copy/Paste**: Duplicate objects and configurations
- **Grid Snapping**: Optional grid alignment for precise placement

### 🎯 Game Systems

#### Platform System
- Static platforms for basic traversal
- Moving platforms with customizable paths
- Spinning platforms with rotation effects
- Damaging platforms that hurt the player
- Blocking platforms that act as solid walls
- Visual platform editor with movement zone drawing

#### Props System
- 50+ decorative props (houses, trees, fences, etc.)
- Interactive props (chests, doors, signs)
- Destroyable props with durability
- Props bound to moving platforms
- Grid-based props editor modal

#### Enemy System
- Multiple enemy types (slimes, bats, skeletons)
- AI pathfinding and patrol behaviors
- Combat interactions with the player
- Health and damage systems
- Visual enemy placement and configuration

#### Lootables System
- Collectible items (coins, hearts, gems)
- Health restoration pickups
- Score and currency system
- Grid-based lootables editor modal

#### Scene System
- Multiple interconnected scenes/levels
- Scene transitions with player positioning
- Scene boundaries and camera limits
- Start scene configuration
- Scene duplication and management

### 🎨 Visual Features
- **Parallax Backgrounds**: Multi-layer scrolling backgrounds
- **Particle Effects**: Combat hits, explosions, and ambient effects
- **Damage Numbers**: Floating damage indicators
- **Death Animations**: Different death effects based on damage type
- **UI Overlays**: HUD, inventory, and dialog systems

### 💾 Data Management
- **Local Storage**: Automatic saving to browser storage
- **Scene Persistence**: All level data saved between sessions
- **Settings Storage**: User preferences and configurations
- **Import/Export**: Share levels via JSON files
- **Version Control**: Compatible with git for collaboration

## Target Audience

This engine is designed for:

1. **Game Developers**: Quick prototyping of 2D platform games
2. **Level Designers**: Visual tools for creating game levels
3. **Educators**: Teaching game development concepts
4. **Hobbyists**: Creating games without complex setup
5. **Web Developers**: Learning canvas and game programming

## Browser Requirements

### Minimum Requirements
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Resolution**: 1280x720 minimum
- **JavaScript**: ES6+ support required

### Recommended
- **Resolution**: 1920x1080 or higher
- **RAM**: 4GB+ for smooth editor performance
- **GPU**: Hardware acceleration enabled
- **Input**: Mouse required, keyboard for controls

## Performance Characteristics

- **Frame Rate**: 60 FPS target on modern hardware
- **Canvas Size**: 1280x720 default game resolution
- **Sprite Loading**: Asynchronous with preloading
- **Memory Usage**: ~100-200MB for typical scenes
- **Storage Size**: ~1-5MB per scene in localStorage

## Development Workflow

1. **Start Development**: Press `Tab` to enter development mode
2. **Place Elements**: Click buttons to add platforms, props, enemies
3. **Configure**: Select objects to edit properties
4. **Test**: Press `Tab` again to test immediately
5. **Save**: Press `Ctrl+S` to save scene data
6. **Iterate**: Repeat until satisfied

## Project Structure

The game follows a modular architecture:

```
platformgame/
├── index.html           # Main game entry point
├── game.js             # Core game loop and initialization
├── css/                # Styles for UI and modals
├── assets/             # Sprites, sounds, and resources
├── js/                 # Game systems and logic
│   ├── camera/         # Camera and viewport
│   ├── enemy/          # Enemy AI and behaviors
│   ├── input/          # Input handling
│   ├── inventory/      # Item management
│   ├── lootables/      # Collectibles system
│   ├── platforms/      # Platform mechanics
│   ├── player/         # Player controls
│   ├── props/          # Props and decorations
│   ├── scenes/         # Scene management
│   └── ui/            # User interface
└── wiki/              # Documentation

```

## Getting Started

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. Press `Tab` to enter development mode
4. Start creating your game!

For detailed instructions, see the [Getting Started Guide](./04-getting-started.md).

---

Next: [Architecture](./02-architecture.md) →