/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, LEVEL_WORDS } from './types';
import { audio } from './components/System/Audio';

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  
  // Combo Stats
  comboDistance: number;
  comboMultiplier: number;
  maxComboMultiplier: number;
  
  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Skins System
  activeSkin: string;
  unlockedSkins: string[];

  // Ads & Premium System
  isPremium: boolean;
  isAdActive: boolean;
  adActiveType: 'rewarded_gems' | 'rewarded_revive' | 'interstitial' | null;
  hasRevivedThisRun: boolean;
  adWatchCount: number;
  playtimeSinceLastAd: number;
  nextAdThreshold: number;
  accumulatePlaytime: (seconds: number) => void;
  setPremium: (isPremium: boolean) => void;
  triggerAd: (type: 'rewarded_gems' | 'rewarded_revive' | 'interstitial', onAdComplete?: () => void, forceSimulator?: boolean) => void;
  closeAd: (completed: boolean) => void;
  claimFreeGems: () => void;
  revivePlayer: () => void;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  collectHeart: () => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  incrementDistance: (dist: number) => void;
  
  // Pause/Resume
  togglePause: () => void;
  goHome: () => void;

  // Skins Actions
  selectSkin: (skinId: string) => void;
  unlockSkin: (skinId: string, cost: number) => boolean;
  
  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;

  // Performance & Graphic Modes
  // Mode 1: Lag Free Mode (first, default, ultra-smooth 60+ FPS)
  // Mode 2: High Graphics Mode (second, neon bloom glow & shaders)
  enableEffects: boolean;
  graphicsMode: 'lag_free' | 'high_graphics';
  setGraphicsMode: (mode: 'lag_free' | 'high_graphics') => void;
  toggleEffects: () => void;
}

const MAX_LEVEL = 3;

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  comboDistance: 0,
  comboMultiplier: 1,
  maxComboMultiplier: 1,
  
  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,

  // Skins System defaults
  activeSkin: 'default',
  unlockedSkins: ['default'],

  // Ads & Premium defaults
  isPremium: typeof window !== 'undefined' ? localStorage.getItem('game_premium') === 'true' : false,
  isAdActive: false,
  adActiveType: null,
  hasRevivedThisRun: false,
  adWatchCount: 0,
  playtimeSinceLastAd: 0,
  nextAdThreshold: Math.floor(Math.random() * (300 - 180 + 1)) + 180,

  // Mode 1: Lag Free Mode (first & default) | Mode 2: High Graphics
  enableEffects: typeof window !== 'undefined' ? localStorage.getItem('enable_effects') === 'true' : false,
  graphicsMode: typeof window !== 'undefined' && localStorage.getItem('enable_effects') === 'true' ? 'high_graphics' : 'lag_free',

  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    comboDistance: 0,
    comboMultiplier: 1,
    maxComboMultiplier: 1,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,
    hasRevivedThisRun: false
  }),

  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    comboDistance: 0,
    comboMultiplier: 1,
    maxComboMultiplier: 1,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,
    hasRevivedThisRun: false
  }),

  togglePause: () => {
    const { status } = get();
    if (status === GameStatus.PLAYING) {
      set({ status: GameStatus.PAUSED });
    } else if (status === GameStatus.PAUSED) {
      set({ status: GameStatus.PLAYING });
    }
  },

  goHome: () => {
    set({
      status: GameStatus.MENU,
      score: 0,
      lives: 3,
      maxLives: 3,
      speed: 0,
      collectedLetters: [],
      level: 1,
      laneCount: 3,
      distance: 0,
      comboDistance: 0,
      comboMultiplier: 1,
      maxComboMultiplier: 1,
      hasDoubleJump: false,
      hasImmortality: false,
      isImmortalityActive: false
    });
  },

  selectSkin: (skinId) => {
    const { unlockedSkins } = get();
    if (unlockedSkins.includes(skinId)) {
      set({ activeSkin: skinId });
    }
  },

  unlockSkin: (skinId, cost) => {
    const { gemsCollected, unlockedSkins } = get();
    if (gemsCollected >= cost && !unlockedSkins.includes(skinId)) {
      set({
        gemsCollected: gemsCollected - cost,
        unlockedSkins: [...unlockedSkins, skinId],
        activeSkin: skinId
      });
      return true;
    }
    return false;
  },

  takeDamage: () => {
    const { lives, isImmortalityActive, comboMultiplier } = get();
    if (isImmortalityActive) return; // No damage if skill is active

    if (comboMultiplier > 1) {
      audio.playComboReset();
    }

    if (lives > 1) {
      set({ 
        lives: lives - 1,
        comboDistance: 0,
        comboMultiplier: 1
      });
    } else {
      set({ 
        lives: 0, 
        status: GameStatus.GAME_OVER, 
        speed: 0,
        comboDistance: 0,
        comboMultiplier: 1
      });
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + (value * state.comboMultiplier), 
    gemsCollected: state.gemsCollected + 1 
  })),

  collectHeart: () => {
    const { lives, maxLives } = get();
    if (lives < maxLives) {
      set({ lives: lives + 1 });
    }
  },

  setDistance: (dist) => set({ distance: dist }),

  incrementDistance: (dist) => {
    const state = get();
    if (state.status !== GameStatus.PLAYING) return;

    const nextDistance = state.distance + dist;
    const nextComboDistance = state.comboDistance + dist;
    
    // Each 50 LY run without hit increases the combo multiplier (capped at 10x)
    const nextComboMultiplier = Math.min(10, 1 + Math.floor(nextComboDistance / 50));
    
    if (nextComboMultiplier > state.comboMultiplier) {
      audio.playComboUp(nextComboMultiplier);
    }
    
    // Fractional real-time score award from running: 0.5 points per unit run * combo multiplier
    const scoreGain = dist * state.comboMultiplier * 0.5;
    const nextScore = Math.round(state.score + scoreGain);
    const nextMaxCombo = Math.max(state.maxComboMultiplier, nextComboMultiplier);

    set({
      distance: nextDistance,
      comboDistance: nextComboDistance,
      comboMultiplier: nextComboMultiplier,
      maxComboMultiplier: nextMaxCombo,
      score: nextScore
    });
  },

  collectLetter: (index) => {
    const { collectedLetters, level, speed } = get();
    const currentTarget = LEVEL_WORDS[level] || ['G', 'E', 'M', 'I', 'N', 'I'];
    
    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      
      // LINEAR SPEED INCREASE: Add 10% of BASE speed per letter
      // This ensures 110% -> 120% -> 130% consistent steps
      const speedIncrease = RUN_SPEED_BASE * 0.10;
      const nextSpeed = speed + speedIncrease;

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      // Check if full word collected
      if (newLetters.length === currentTarget.length) {
        if (level < MAX_LEVEL) {
            // Immediately advance level
            // The Shop Portal will be spawned by LevelManager at the start of the new level
            get().advanceLevel();
        } else {
            // Victory Condition
            set({
                status: GameStatus.VICTORY,
                score: get().score + 5000
            });
        }
      }
    }
  },

  advanceLevel: () => {
      const { level, laneCount, speed } = get();
      const nextLevel = level + 1;
      
      // LINEAR LEVEL INCREASE: Add 40% of BASE speed per level
      // Combined with the 6 letters (60%), this totals +100% speed per full level cycle
      const speedIncrease = RUN_SPEED_BASE * 0.40;
      const newSpeed = speed + speedIncrease;

      set({
          level: nextLevel,
          laneCount: Math.min(laneCount + 2, 9), // Expand lanes
          status: GameStatus.PLAYING, // Keep playing, user runs into shop
          speed: newSpeed,
          collectedLetters: [] // Reset letters
      });
  },

  openShop: () => set({ status: GameStatus.SHOP }),
  
  closeShop: () => set({ status: GameStatus.PLAYING }),

  buyItem: (type, cost) => {
      const { score, maxLives, lives } = get();
      
      if (score >= cost) {
          set({ score: score - cost });
          
          switch (type) {
              case 'DOUBLE_JUMP':
                  set({ hasDoubleJump: true });
                  break;
              case 'MAX_LIFE':
                  set({ maxLives: maxLives + 1, lives: lives + 1 });
                  break;
              case 'HEAL':
                  set({ lives: Math.min(lives + 1, maxLives) });
                  break;
              case 'IMMORTAL':
                  set({ hasImmortality: true });
                  break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ isImmortalityActive: true });
          
          // Lasts 5 seconds
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  setStatus: (status) => set({ status }),
  increaseLevel: () => set((state) => ({ level: state.level + 1 })),
  setGraphicsMode: (mode) => {
      const enableEffects = mode === 'high_graphics';
      try {
          localStorage.setItem('enable_effects', String(enableEffects));
      } catch (e) {}
      set({ enableEffects, graphicsMode: mode });
  },

  toggleEffects: () => set((state) => {
      const newVal = !state.enableEffects;
      const newMode = newVal ? 'high_graphics' : 'lag_free';
      try {
          localStorage.setItem('enable_effects', String(newVal));
      } catch (e) {}
      return { enableEffects: newVal, graphicsMode: newMode };
  }),

  setPremium: (isPremium) => {
      try {
          localStorage.setItem('game_premium', String(isPremium));
      } catch (e) {}
      set({ isPremium });
  },

  triggerAd: (type: 'rewarded_gems' | 'rewarded_revive' | 'interstitial', onAdComplete?: () => void, forceSimulator: boolean = false) => {
      const { isPremium } = get();
      if (isPremium) {
          if (type === 'rewarded_gems') {
              get().claimFreeGems();
          } else if (type === 'rewarded_revive') {
              get().revivePlayer();
          }
          if (onAdComplete) onAdComplete();
          return;
      }

      // Helper to open the full-screen interactive test ad overlay immediately
      const showAdOverlay = () => {
          const currentStatus = get().status;
          if (currentStatus === GameStatus.PLAYING) {
              set({ status: GameStatus.PAUSED });
          }
          set({
              isAdActive: true,
              adActiveType: type,
          });
          (useStore as any)._onAdComplete = onAdComplete;
      };

      if (forceSimulator) {
          showAdOverlay();
          return;
      }

      let googleAdStarted = false;
      const gAdBreak = typeof window !== 'undefined' ? (window as any).adBreak : null;

      if (typeof gAdBreak === 'function') {
          try {
              const adPlacementType = type === 'interstitial' ? 'next' : 'reward';
              
              // Failsafe timer: In sandbox/preview/iframe or with ad blockers,
              // Google SDK will not invoke beforeAd. If it doesn't fire within 900ms,
              // immediately show our interactive ad overlay so tests and rewards work!
              const fallbackTimer = setTimeout(() => {
                  if (!googleAdStarted && !get().isAdActive) {
                      console.log('[AdSense H5] Google Ad SDK timeout or blocked in preview - triggering Ad Overlay');
                      showAdOverlay();
                  }
              }, 900);

              gAdBreak({
                  type: adPlacementType,
                  name: type,
                  beforeAd: () => {
                      clearTimeout(fallbackTimer);
                      googleAdStarted = true;
                      try {
                          const currentStatus = get().status;
                          if (currentStatus === GameStatus.PLAYING) {
                              set({ status: GameStatus.PAUSED });
                          }
                      } catch (e) {}
                  },
                  afterAd: () => {
                      console.log('[AdSense H5] afterAd called');
                  },
                  adDismissed: () => {
                      console.log('[AdSense H5] adDismissed called');
                  },
                  adViewed: () => {
                      console.log('[AdSense H5] adViewed called');
                  },
                  adBreakDone: (placementInfo: any) => {
                      clearTimeout(fallbackTimer);
                      console.log('[AdSense H5] adBreakDone:', placementInfo);
                      const breakStatus = placementInfo ? placementInfo.breakStatus : '';
                      if (breakStatus === 'viewed' || breakStatus === 'dismissed') {
                          googleAdStarted = true;
                          set({ adWatchCount: get().adWatchCount + 1 });
                          if (type === 'rewarded_gems') {
                              get().claimFreeGems();
                          } else if (type === 'rewarded_revive') {
                              get().revivePlayer();
                          }
                          if (onAdComplete) onAdComplete();
                      } else {
                          // Google reported error, timeout, noAdPreloaded, frequencyCapped, etc.
                          // Fallback to our interactive ad overlay so the test/gameplay flow doesn't break!
                          showAdOverlay();
                      }
                  }
              });
          } catch (e) {
              console.warn('[AdSense H5] SDK call threw error, opening ad overlay:', e);
              showAdOverlay();
          }
      } else {
          showAdOverlay();
      }
  },

  closeAd: (completed) => {
      const { adActiveType, adWatchCount } = get();
      set({ isAdActive: false, adActiveType: null });
      
      if (completed) {
          set({ adWatchCount: adWatchCount + 1 });
          if (adActiveType === 'rewarded_gems') {
              get().claimFreeGems();
          } else if (adActiveType === 'rewarded_revive') {
              get().revivePlayer();
          }
      }
      
      const onAdComplete = (useStore as any)._onAdComplete;
      if (onAdComplete) {
          onAdComplete();
          (useStore as any)._onAdComplete = null;
      }
  },

  accumulatePlaytime: (seconds) => {
      const { isPremium, isAdActive, status, playtimeSinceLastAd, nextAdThreshold, triggerAd } = get();
      if (isPremium || isAdActive || status !== GameStatus.PLAYING) return;
      
      const newPlaytime = playtimeSinceLastAd + seconds;
      if (newPlaytime >= nextAdThreshold) {
          const newThreshold = Math.floor(Math.random() * (300 - 180 + 1)) + 180;
          set({
              playtimeSinceLastAd: 0,
              nextAdThreshold: newThreshold
          });
          
          triggerAd('interstitial', () => {
              set({ status: GameStatus.PLAYING });
          });
      } else {
          set({ playtimeSinceLastAd: newPlaytime });
      }
  },

  claimFreeGems: () => {
      set((state) => ({ gemsCollected: state.gemsCollected + 50 }));
      try {
          audio.playComboUp(3);
      } catch (e) {}
  },

  revivePlayer: () => {
      set({
          lives: 1,
          status: GameStatus.PLAYING,
          speed: RUN_SPEED_BASE,
          hasRevivedThisRun: true
      });
  },
}));
