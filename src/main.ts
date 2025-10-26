/**
 * Main entry point for the Platform RPG Game
 *
 * This file serves as the webpack entry point.
 * Currently, it imports CSS files and allows the existing JS files
 * to be loaded via script tags in the HTML.
 *
 * Future: Gradually convert JS files to TypeScript modules and import them here.
 */

// Import all CSS files
import '../css/base.css';
import '../css/cursors.css';
import '../css/editor.css';
import '../css/scenes.css';
import '../css/context-menu.css';
import '../css/modals.css';
import '../css/inventory.css';
import '../css/themes.css';
import '../css/game-selector.css';
import '../css/user-menu.css';
import '../css/sync-notifications.css';

// Log initialization
console.log('🚀 Platform RPG - Webpack build initialized');
console.log('📦 TypeScript setup complete');
console.log('🎮 Game engine loading...');

// Future: Import game modules here as they are converted to ES6 modules
// Example:
// import { EnemyManager } from '../js/enemy/enemyManager';
// import { PropSystem } from '../js/props/propSystem';
// etc.

// For now, all game logic is loaded via script tags in index.html
// This allows for a gradual migration to modules
