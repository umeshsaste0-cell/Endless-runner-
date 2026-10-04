/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  PAUSED = 'PAUSED'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE',
  HEART = 'HEART'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  value?: string; // For letters (G, E, M...)
  color?: string;
  targetIndex?: number; // Index in the GEMINI target word
  points?: number; // Score value for gems
  hasFired?: boolean; // For Aliens
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 22.5;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20; // Behind player

export const LEVEL_WORDS = [
  [], // Index 0
  ['G', 'E', 'M', 'I', 'N', 'I'], // Level 1
  ['C', 'O', 'S', 'M', 'O', 'S'], // Level 2
  ['N', 'E', 'B', 'U', 'L', 'A']  // Level 3
];

// Google-ish Neon Colors: Blue, Red, Yellow, Blue, Green, Red
export const GEMINI_COLORS = [
    '#2979ff', // G - Blue
    '#ff1744', // E - Red
    '#ffea00', // M - Yellow
    '#2979ff', // I - Blue
    '#00e676', // N - Green
    '#ff1744', // I - Red
];

export interface PlayerSkin {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  cost: number; // Cost in gems collected total
}

export const PLAYER_SKINS: PlayerSkin[] = [
  { id: 'default', name: 'CLASSIC NEON', color: '#00aaff', glowColor: '#00ffff', cost: 0 },
  { id: 'ruby', name: 'CYBER RUBY', color: '#ff1744', glowColor: '#ff5252', cost: 10 },
  { id: 'emerald', name: 'EMERALD MATRIX', color: '#00e676', glowColor: '#69f0ae', cost: 25 },
  { id: 'amber', name: 'GOLDEN SPARK', color: '#ffab00', glowColor: '#ffd600', cost: 50 },
  { id: 'amethyst', name: 'AMETHYST WAVE', color: '#d500f9', glowColor: '#f50057', cost: 75 },
  { id: 'obsidian', name: 'VOID OBSIDIAN', color: '#252525', glowColor: '#ff007f', cost: 100 }
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; // Lucide icon component
    oneTime?: boolean; // If true, remove from pool after buying
}
