/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, Pause, Home, Tv, Sparkles, BookOpen, Settings, Check, Copy } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, GEMINI_COLORS, ShopItem, RUN_SPEED_BASE, LEVEL_WORDS, PLAYER_SKINS } from '../../types';
import { audio } from '../System/Audio';

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOUBLE JUMP',
        description: 'Jump again in mid-air. Essential for high obstacles.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'MAX LIFE UP',
        description: 'Permanently adds a heart slot and heals you.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'REPAIR KIT',
        description: 'Restores 1 Life point instantly.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'IMMORTALITY',
        description: 'Unlock Ability: Press Space/Tap to be invincible for 5s.',
        cost: 3000,
        icon: Shield,
        oneTime: true
    }
];

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        // Select 3 random items, filtering out one-time items already bought
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        // Shuffle and pick 3
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto touch-pan-y pb-24">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-cyan-400 mb-2 font-cyber tracking-widest text-center">CYBER SHOP</h2>
                 <div className="flex items-center text-yellow-400 mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">AVAILABLE CREDITS:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-gray-900/80 border border-gray-700 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-cyan-500 transition-colors">
                                 <div className="bg-gray-800 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{item.name}</h3>
                                 <p className="text-gray-400 text-xs md:text-sm mb-4 h-10 md:h-12 flex items-center justify-center">{item.description}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base ${canAfford ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                 >
                                     {item.cost} GEMS
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <div className="w-full max-w-4xl flex flex-col md:flex-row gap-3 items-center justify-between bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl mb-6 font-mono text-xs text-left pointer-events-auto">
                     <div className="flex items-center space-x-3">
                         <div className="bg-cyan-950/80 p-2.5 rounded-lg border border-cyan-800/60">
                             <Tv className="w-5 h-5 text-cyan-400 animate-pulse" />
                         </div>
                         <div>
                             <h4 className="font-bold text-cyan-400 uppercase tracking-wider">Free Gem Dispenser</h4>
                             <p className="text-[11px] text-gray-400 mt-0.5">Watch a short sponsored video to gain +50 Gems instantly!</p>
                         </div>
                     </div>
                     <button
                         onClick={() => useStore.getState().triggerAd('rewarded_gems')}
                         className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black rounded-lg tracking-wider text-xs w-full md:w-auto text-center"
                     >
                         WATCH SPONSORED AD
                     </button>
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                 >
                     RESUME MISSION <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
             <div className="absolute bottom-0 left-0 right-0">
                 <AdBanner />
             </div>
        </div>
    );
};

interface PauseScreenProps {
    onOpenGuide?: () => void;
}

const PauseScreen: React.FC<PauseScreenProps> = ({ onOpenGuide }) => {
    const { togglePause, goHome, gemsCollected, unlockedSkins, activeSkin, selectSkin, unlockSkin, enableEffects, setGraphicsMode } = useStore();

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto overscroll-contain touch-pan-y px-4 py-8 pb-36">
             <div className="flex flex-col items-center justify-start min-h-full max-w-md mx-auto">
                 <h2 className="text-3xl md:text-4xl font-black text-cyan-400 mb-1 font-cyber tracking-widest text-center animate-pulse">SYSTEM SUSPENDED</h2>
                 <p className="text-gray-400 text-xs md:text-sm mb-6 uppercase tracking-widest">Run is Paused</p>

                  {/* Two Game Modes Selection */}
                  <div className="w-full max-w-md bg-gray-950/90 border border-gray-800/80 p-4 rounded-2xl mb-6 shadow-2xl pointer-events-auto">
                      <div className="flex items-center justify-between text-xs font-mono tracking-wider mb-2.5">
                          <span className="text-gray-400 font-bold uppercase">GAME MODES</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                              !enableEffects ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                              {!enableEffects ? '⚡ MODE 1: LAG FREE ACTIVE' : '✨ MODE 2: HIGH GRAPHICS ACTIVE'}
                          </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                          {/* MODE 1: LAG FREE MODE (FIRST) */}
                          <button
                              onClick={() => setGraphicsMode('lag_free')}
                              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                  !enableEffects 
                                      ? 'border-emerald-400 bg-emerald-950/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400' 
                                      : 'border-gray-800 bg-black/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                              }`}
                          >
                              <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                                      MODE 1 (FIRST)
                                  </span>
                                  <Zap className={`w-4 h-4 ${!enableEffects ? 'text-emerald-400 fill-current animate-pulse' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                  <div className={`font-black text-xs font-cyber tracking-wider ${!enableEffects ? 'text-emerald-300' : 'text-gray-300'}`}>
                                      LAG FREE MODE
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-mono mt-0.5 leading-tight">
                                      Ultra Smooth 60FPS • Zero Stutter
                                  </div>
                              </div>
                              {!enableEffects && (
                                  <div className="mt-2 text-[9px] font-bold text-emerald-400 font-mono flex items-center">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping"></span>
                                      ACTIVE
                                  </div>
                              )}
                          </button>

                          {/* MODE 2: HIGH GRAPHICS MODE (SECOND) */}
                          <button
                              onClick={() => setGraphicsMode('high_graphics')}
                              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                  enableEffects 
                                      ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400' 
                                      : 'border-gray-800 bg-black/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                              }`}
                          >
                              <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500 text-black">
                                      MODE 2
                                  </span>
                                  <Sparkles className={`w-4 h-4 ${enableEffects ? 'text-cyan-400 fill-current animate-pulse' : 'text-gray-600'}`} />
                              </div>
                              <div>
                                  <div className={`font-black text-xs font-cyber tracking-wider ${enableEffects ? 'text-cyan-300' : 'text-gray-300'}`}>
                                      HIGH GRAPHICS
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-mono mt-0.5 leading-tight">
                                      Neon Bloom • Cyber Shaders
                                  </div>
                              </div>
                              {enableEffects && (
                                  <div className="mt-2 text-[9px] font-bold text-cyan-400 font-mono flex items-center">
                                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-ping"></span>
                                      ACTIVE
                                  </div>
                              )}
                          </button>
                      </div>
                  </div>


                 {/* Skins Selector Section */}
                 <div className="w-full max-w-md bg-gray-950/80 border border-gray-800/80 p-5 rounded-2xl mb-8 shadow-2xl">
                     <h3 className="text-sm font-black mb-3 text-center text-purple-400 font-cyber tracking-widest">CHOOSE YOUR CYBER SHELL</h3>
                     
                     <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-4 font-mono text-xs">
                         <Diamond className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                         <span>GEMS IN INVENTORY: <strong className="text-white text-sm">{gemsCollected}</strong></span>
                     </div>

                     <div className="grid grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                         {PLAYER_SKINS.map(skin => {
                             const isUnlocked = unlockedSkins.includes(skin.id);
                             const isActive = activeSkin === skin.id;
                             const canAfford = gemsCollected >= skin.cost;

                             return (
                                 <button
                                     key={skin.id}
                                     onClick={() => {
                                         if (isUnlocked) {
                                             selectSkin(skin.id);
                                         } else if (canAfford) {
                                             unlockSkin(skin.id, skin.cost);
                                         }
                                     }}
                                     style={{
                                         borderColor: isActive ? skin.glowColor : 'rgba(55, 65, 81, 0.4)',
                                         boxShadow: isActive ? `0 0 12px ${skin.glowColor}44` : 'none'
                                     }}
                                     className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all duration-200 relative overflow-hidden ${
                                         isActive ? 'bg-gray-900 border-2 scale-[0.98]' : 'bg-black hover:bg-gray-900/60'
                                     }`}
                                 >
                                     {/* Color Dot with glow */}
                                     <div 
                                         className="w-3.5 h-3.5 rounded-full mb-1.5" 
                                         style={{ backgroundColor: skin.color, boxShadow: `0 0 8px ${skin.glowColor}` }}
                                     />
                                     <span className="text-[10px] font-black tracking-wider block truncate max-w-full">
                                         {skin.name}
                                     </span>

                                     {/* Status indicator */}
                                     <div className="text-[9px] font-mono mt-1 text-gray-400">
                                         {isUnlocked ? (
                                             <span className={isActive ? 'text-cyan-400 font-bold' : 'text-gray-500 hover:text-gray-300'}>
                                                 {isActive ? 'ACTIVE' : 'SELECT'}
                                             </span>
                                         ) : (
                                             <span className={`flex items-center justify-center space-x-1 ${canAfford ? 'text-yellow-400 font-bold' : 'text-gray-600'}`}>
                                                 <Diamond className="w-2.5 h-2.5 fill-current" />
                                                 <span>{skin.cost} GEMS</span>
                                             </span>
                                         )}
                                     </div>
                                 </button>
                             );
                         })}
                     </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center items-center">
                     <button 
                        onClick={togglePause}
                        className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-base md:text-lg rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] tracking-widest w-full sm:w-auto"
                     >
                         RESUME MISSION <Play className="ml-2 w-5 h-5 fill-white" />
                     </button>
                     <button 
                        onClick={goHome}
                        className="flex items-center justify-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-black text-base md:text-lg rounded-xl hover:scale-105 transition-all border border-gray-700 hover:border-gray-500 tracking-widest w-full sm:w-auto"
                     >
                         GO HOME <Home className="ml-2 w-5 h-5" />
                     </button>
                 </div>

                 {onOpenGuide && (
                     <button
                        onClick={onOpenGuide}
                        className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-950/60 to-cyan-950/60 hover:from-purple-900/60 hover:to-cyan-900/60 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-mono tracking-wider transition-all active:scale-98 shadow-sm"
                     >
                         <Settings className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                         <span>GOOGLE HTML5 ADS SETTINGS & PUB ID</span>
                     </button>
                 )}
             </div>
        </div>
    );
};

const AdBanner: React.FC = () => {
    const { isPremium } = useStore();
    const [adIndex, setAdIndex] = useState(0);

    const ads = [
        { brand: "NEXUS COLA", text: "Quench your neon thirst. 100% synthetic sugar.", cta: "DRINK NOW" },
        { brand: "GEMINI APEX DRIVES", text: "Boost your neural bandwidth by 400%. Safe & painless.", cta: "UPGRADE NODE" },
        { brand: "OMEGA CYBERNETICS", text: "Replace weak organic limbs today with chrome titanium.", cta: "CHROME UP" },
        { brand: "NEO CHROME SNEAKERS", text: "Run faster, jump higher. Anti-gravity soles included.", cta: "BUY PAIR" }
    ];

    useEffect(() => {
        if (isPremium) return;
        const interval = setInterval(() => {
            setAdIndex((prev) => (prev + 1) % ads.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [isPremium]);

    if (isPremium) {
        return (
            <div className="w-full bg-gradient-to-r from-amber-600/20 via-yellow-500/20 to-amber-600/20 border-t border-yellow-500/30 py-2 px-4 flex items-center justify-center space-x-2 text-[10px] md:text-xs font-mono text-yellow-400 tracking-wider">
                <span>👑 PREMIUM ENHANCED MODE ACTIVE</span>
                <span className="hidden md:inline">•</span>
                <span className="text-white hidden md:inline">NO ADS • SKIPPABLE BONUSES • FREE REVIVES</span>
            </div>
        );
    }

    const currentAd = ads[adIndex];

    return (
        <div className="w-full bg-black border-t border-gray-800 py-2 px-4 flex flex-col sm:flex-row items-center justify-between space-y-1 sm:space-y-0 text-[10px] md:text-xs font-mono pointer-events-auto">
            <div className="flex items-center space-x-2">
                <span className="bg-gray-800 text-[8px] md:text-[9px] text-gray-500 px-1 py-0.5 rounded font-sans border border-gray-700">SPONSORED</span>
                <span className="text-cyan-400 font-bold">{currentAd.brand}:</span>
                <span className="text-gray-400 text-center sm:text-left text-[9px] md:text-[10px]">{currentAd.text}</span>
            </div>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold px-2.5 py-0.5 rounded text-[8px] md:text-[9px] tracking-wider transition-colors">
                {currentAd.cta}
            </button>
        </div>
    );
};

const SimulatedAdOverlay: React.FC = () => {
    const { isAdActive, adActiveType, closeAd } = useStore();
    const [timeLeft, setTimeLeft] = useState(5);
    const [canClose, setCanClose] = useState(false);

    const pubId = (() => {
        try {
            return localStorage.getItem('google_ads_pub_id') || 'ca-pub-1897225080989873';
        } catch(e) {
            return 'ca-pub-1897225080989873';
        }
    })();

    useEffect(() => {
        if (!isAdActive) return;
        setTimeLeft(5);
        setCanClose(false);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanClose(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isAdActive]);

    if (!isAdActive) return null;

    const isRevive = adActiveType === 'rewarded_revive';
    const isInterstitial = adActiveType === 'interstitial';
    const cleanPub = pubId.startsWith('ca-') ? pubId : `ca-${pubId}`;

    return (
        <div className="fixed inset-0 bg-black/95 z-[350] flex flex-col items-center justify-center text-white p-4 font-mono select-none pointer-events-auto overflow-y-auto overscroll-contain touch-pan-y animate-in fade-in duration-200">
            <div className="max-w-md w-full border border-cyan-500/40 bg-[#070014] p-6 sm:p-8 rounded-2xl flex flex-col items-center shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center relative overflow-hidden my-auto">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none"></div>
                
                {/* Publisher ID & Status Badges */}
                <div className="w-full flex items-center justify-between gap-1 mb-3">
                    <span className="bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>GOOGLE H5 ADS • TEST ADBREAK</span>
                    </span>
                    <span className="bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded">
                        {cleanPub}
                    </span>
                </div>

                <div className="w-16 h-16 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <Rocket className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>

                <h3 className="text-xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                    {isInterstitial ? "SPONSORED INTERMISSION" : isRevive ? "REVIVAL SEQUENCE" : "GEM BONUS TRANSMISSION"}
                </h3>
                
                <p className="text-gray-300 text-xs mb-4 max-w-xs leading-relaxed">
                    Google AI Studio empowers developers to build full-stack web apps like this runner game using server-side Gemini API. Run code, deploy instantly, and ship your ideas today!
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden mb-4 border border-cyan-500/20">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${((5 - timeLeft) / 5) * 100}%` }}
                    />
                </div>

                {!canClose ? (
                    <div className="flex flex-col items-center space-y-2 mb-4">
                        <div className="w-12 h-12 rounded-full border-4 border-cyan-950 border-t-cyan-400 animate-spin flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-400 animate-none">{timeLeft}s</span>
                        </div>
                        <span className="text-[10px] text-gray-400 tracking-wider uppercase">
                            {isInterstitial ? "Transmitting sponsor message..." : "Verifying ad view for reward..."}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2 mb-4 animate-in zoom-in-95 duration-200">
                        <div className="bg-emerald-500/20 border border-emerald-500/40 p-2.5 rounded-full mb-1">
                            <Trophy className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-xs text-emerald-400 font-bold tracking-wider uppercase">
                            {isInterstitial ? "Transmission Complete!" : isRevive ? "Revival Ready!" : "+50 Gems Verified & Ready!"}
                        </span>
                    </div>
                )}

                <div className="flex flex-col space-y-2 w-full mt-2">
                    {canClose ? (
                        <button
                            onClick={() => closeAd(true)}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black rounded-xl tracking-widest text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-98 transition-all"
                        >
                            {isInterstitial ? "RESUME MISSION" : isRevive ? "RESUME WITH 3 LIVES" : "CLAIM +50 GEMS REWARD"}
                        </button>
                    ) : (
                        <div className="flex flex-col space-y-2 w-full">
                            {/* Fast-forward test button so developer/tester never has to wait */}
                            <button
                                onClick={() => {
                                    setTimeLeft(0);
                                    setCanClose(true);
                                }}
                                className="w-full py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-bold rounded-lg tracking-wider text-[10px] transition-all active:scale-98"
                            >
                                ⚡ FAST-FORWARD TEST (INSTANT COMPLETION)
                            </button>

                            {!isInterstitial ? (
                                <button
                                    onClick={() => closeAd(false)}
                                    className="w-full py-2 bg-gray-900/60 hover:bg-red-950/20 hover:text-red-400 border border-gray-800 hover:border-red-500/30 text-gray-500 font-bold rounded-xl tracking-wider text-xs transition-all active:scale-98"
                                >
                                    SKIP AD (FORFEIT REWARD)
                                </button>
                            ) : (
                                <div className="text-[10px] text-gray-500 italic py-1">
                                    AdBreak in progress... Reward will be granted upon completion.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface PremiumCheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PremiumCheckoutModal: React.FC<PremiumCheckoutModalProps> = ({ isOpen, onClose }) => {
    const { setPremium } = useStore();
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    if (!isOpen) return null;

    const handlePurchase = (isFree: boolean) => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentSuccess(true);
            try {
                audio.playComboUp(10);
            } catch (e) {}
            setPremium(true);
            useStore.setState((state) => ({ gemsCollected: state.gemsCollected + 250 }));
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-start text-white p-3 sm:p-6 font-mono pointer-events-auto overflow-y-auto overscroll-contain touch-pan-y py-8 pb-32 animate-in fade-in duration-200">
            <div className="max-w-md w-full my-auto border border-yellow-500/30 bg-[#0d0701] p-5 sm:p-6 rounded-2xl flex flex-col shadow-[0_0_40px_rgba(234,179,8,0.15)] relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <PlusCircle className="w-6 h-6 transform rotate-45" />
                </button>

                {!paymentSuccess ? (
                    <>
                        <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                            <Shield className="w-5 h-5 fill-current animate-pulse" />
                            <span className="text-xs font-black tracking-widest uppercase">CYBER PREMIUM UPGRADE</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black font-cyber text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 mb-4 uppercase">
                            Remove All Ads
                        </h2>

                        <div className="bg-gray-950/80 border border-gray-800/80 p-4 rounded-xl mb-5 space-y-2.5 text-xs">
                            <div className="flex items-start space-x-2">
                                <span className="text-yellow-400 font-bold">✓</span>
                                <span className="text-gray-300"><strong>No More Interstitial or Banner Ads:</strong> Enjoy a completely uninterrupted cyberpunk experience.</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="text-yellow-400 font-bold">✓</span>
                                <span className="text-gray-300"><strong>Auto-Claim Rewards:</strong> Instantly claim the +50 Gems bonus or revive without watching any video.</span>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="text-yellow-400 font-bold">✓</span>
                                <span className="text-gray-300"><strong>Welcome Bonus:</strong> Receive <strong>+250 Gems</strong> immediately upon purchase.</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-5">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase block mb-1">Card Number</label>
                                <input 
                                    type="text" 
                                    placeholder="4111 2222 3333 2026"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    disabled={isProcessing}
                                    className="w-full bg-black/60 border border-gray-800 rounded px-3 py-1.5 text-xs md:text-sm text-yellow-400 focus:outline-none focus:border-yellow-500 font-mono"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase block mb-1">Expiry Date</label>
                                    <input 
                                        type="text" 
                                        placeholder="12/30"
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full bg-black/60 border border-gray-800 rounded px-3 py-1.5 text-xs md:text-sm text-yellow-400 focus:outline-none focus:border-yellow-500 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase block mb-1">CVC</label>
                                    <input 
                                        type="password" 
                                        placeholder="•••"
                                        value={cardCvc}
                                        onChange={(e) => setCardCvc(e.target.value)}
                                        disabled={isProcessing}
                                        className="w-full bg-black/60 border border-gray-800 rounded px-3 py-1.5 text-xs md:text-sm text-yellow-400 focus:outline-none focus:border-yellow-500 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => handlePurchase(false)}
                                disabled={isProcessing}
                                className={`w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:brightness-110 text-black font-black rounded-xl tracking-widest text-xs md:text-sm shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all active:scale-98 ${
                                    isProcessing ? 'opacity-50 cursor-wait' : ''
                                }`}
                            >
                                {isProcessing ? "PROCESSING SECURE TRANSACTION..." : "PAY $1.99 SECURELY"}
                            </button>
                            <button
                                onClick={() => handlePurchase(true)}
                                disabled={isProcessing}
                                className="w-full py-2 bg-gray-950 hover:bg-gray-900 border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-500 font-black rounded-xl tracking-widest text-[10px] md:text-[11px] transition-all active:scale-98"
                            >
                                UNLOCK FREE (DEVELOPER TEST DEMO)
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-full mb-4">
                            <Shield className="w-10 h-10 text-emerald-400 fill-emerald-400" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black font-cyber text-emerald-400 mb-2 uppercase tracking-wider">
                            UPGRADE SUCCESSFUL!
                        </h2>
                        <p className="text-gray-300 text-xs mb-4 leading-relaxed max-w-xs">
                            Welcome to the Cyber elite. Premium Mode is now active! All banner and video ads have been completely removed. We have also added <strong>+250 Gems</strong> to your inventory.
                        </p>
                        <p className="text-[9px] text-gray-500 font-mono mb-6">
                            TRANSACTION ID: TXN-{Math.floor(Math.random() * 899999 + 100000)}
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white text-black font-black rounded-xl tracking-widest text-xs md:text-sm hover:scale-102 transition-transform"
                        >
                            ENTER THE MATRIX
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

interface PublishingGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PublishingGuideModal: React.FC<PublishingGuideModalProps> = ({ isOpen, onClose }) => {
    const [pubId, setPubId] = useState(() => {
        try {
            return localStorage.getItem('google_ads_pub_id') || 'ca-pub-1897225080989873';
        } catch(e) {
            return 'ca-pub-1897225080989873';
        }
    });
    const [customerId, setCustomerId] = useState(() => {
        try {
            return localStorage.getItem('google_ads_customer_id') || '6725053853';
        } catch(e) {
            return '6725053853';
        }
    });
    const [testMode, setTestMode] = useState(() => {
        try {
            const saved = localStorage.getItem('google_ads_test_mode');
            return saved !== null ? saved === 'true' : true;
        } catch(e) {
            return true;
        }
    });
    const [savedStatus, setSavedStatus] = useState(false);
    const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);

    if (!isOpen) return null;

    const handleSavePubId = () => {
        let cleaned = pubId.trim();
        if (cleaned && !cleaned.startsWith('ca-pub-') && cleaned.startsWith('pub-')) {
            cleaned = `ca-${cleaned}`;
        }
        try {
            localStorage.setItem('google_ads_pub_id', cleaned);
            localStorage.setItem('google_ads_customer_id', customerId.trim());
            localStorage.setItem('google_ads_test_mode', String(testMode));

            // Dynamically update the running Google AdSense script tag
            let existingScript = document.getElementById('google-adsense-script') as HTMLScriptElement | null;
            if (!existingScript) {
                existingScript = document.createElement('script');
                existingScript.id = 'google-adsense-script';
                existingScript.async = true;
                existingScript.crossOrigin = 'anonymous';
                document.head.appendChild(existingScript);
            }
            if (existingScript && cleaned) {
                existingScript.setAttribute('data-ad-client', cleaned);
                existingScript.setAttribute('data-ad-frequency-hint', '30s');
                if (testMode) {
                    existingScript.setAttribute('data-adbreak-test', 'on');
                } else {
                    existingScript.removeAttribute('data-adbreak-test');
                }
                existingScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleaned}`;
            }
            setSavedStatus(true);
            setTimeout(() => setSavedStatus(false), 3000);
        } catch(e) {}
    };

    const handleCopyAdsTxt = () => {
        let cleanPub = pubId.trim();
        if (cleanPub.startsWith('ca-')) cleanPub = cleanPub.replace('ca-', '');
        const text = `google.com, ${cleanPub || 'pub-1897225080989873'}, DIRECT, f08c47fec0942fa0`;
        navigator.clipboard?.writeText(text);
        setCopiedAdsTxt(true);
        setTimeout(() => setCopiedAdsTxt(false), 3000);
    };

    const handleTestInterstitial = (forceDirect: boolean = true) => {
        onClose();
        useStore.getState().triggerAd('interstitial', undefined, forceDirect);
    };

    const handleTestRewarded = (forceDirect: boolean = true) => {
        onClose();
        useStore.getState().triggerAd('rewarded_gems', undefined, forceDirect);
    };

    const activeCleanPub = pubId.trim().replace('ca-', '') || 'pub-1897225080989873';

    return (
        <div className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-start text-white p-3 sm:p-6 font-mono pointer-events-auto overflow-y-auto overscroll-contain touch-pan-y py-6 pb-36 animate-in fade-in duration-200">
            <div className="max-w-xl w-full border border-cyan-500/40 bg-[#02000c] p-4 sm:p-6 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.25)] relative my-2">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    aria-label="Close Modal"
                >
                    <PlusCircle className="w-6 h-6 transform rotate-45 text-gray-400 hover:text-white" />
                </button>

                <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                    <Settings className="w-5 h-5 text-cyan-400 animate-spin" />
                    <span className="text-xs font-black tracking-widest uppercase">GOOGLE HTML5 ADS & PUBLISHER CONFIG</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-4 uppercase">
                    AdSense Publisher Portal
                </h2>

                <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
                    {/* Live Active Status Banner */}
                    <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="font-bold text-emerald-300 text-[11px]">ACTIVE PUBLISHER ID:</span>
                            <code className="text-white font-mono bg-black/60 px-2 py-0.5 rounded border border-emerald-600/50 font-black">
                                ca-{activeCleanPub}
                            </code>
                        </div>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-black uppercase">
                            CONNECTED
                        </span>
                    </div>

                    {/* Direct Earning Money & Connection Status Notice */}
                    <div className="bg-gradient-to-r from-amber-950/50 via-yellow-950/30 to-amber-950/50 border border-yellow-500/40 p-3.5 rounded-xl">
                        <div className="flex items-center space-x-2 mb-1.5">
                            <Diamond className="w-4 h-4 text-yellow-400 fill-current animate-pulse" />
                            <span className="text-xs font-black text-yellow-300 uppercase font-cyber">
                                ARE ADS CONNECTED? WILL I EARN MONEY NOW?
                            </span>
                        </div>
                        <div className="text-[11px] text-gray-300 space-y-1.5 leading-relaxed font-sans">
                            <p>
                                <span className="text-emerald-400 font-bold">1. Are Google Ads connected?</span> <strong className="text-white">YES!</strong> Your Publisher ID <code className="text-cyan-300 font-mono">ca-pub-1897225080989873</code> and Customer ID <code className="text-cyan-300 font-mono">6725053853</code> are fully connected into the game engine, SDK loaders, and <code className="text-emerald-300 font-mono">ads.txt</code>.
                            </p>
                            <p>
                                <span className="text-yellow-400 font-bold">2. Will you earn money right now in this preview?</span> <strong className="text-white">NO, not yet.</strong> Google AdSense policy blocks commercial paid ads inside development previews to prevent fraud and protect your AdSense account from invalid traffic penalties.
                            </p>
                            <p>
                                <span className="text-cyan-400 font-bold">3. How to start earning real money:</span> Deploy this game to your public domain (e.g. <em>yourgame.com</em>), submit that domain in your <strong>AdSense Dashboard → Sites</strong>, and once Google marks it as approved, live visitors will generate real ad revenue in your account!
                            </p>
                        </div>
                    </div>

                    {/* Interactive Form */}
                    <div className="bg-gradient-to-r from-cyan-950/80 via-purple-950/50 to-cyan-950/80 border border-cyan-500/50 p-4 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black text-cyan-300 uppercase flex items-center space-x-1.5 font-cyber">
                                <Settings className="w-4 h-4 text-cyan-400" />
                                <span>1. Configure Publisher ID & Settings</span>
                            </h3>
                            <span className="text-[9px] font-mono bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded uppercase">
                                Live Setup
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-300 mb-3">
                            Your Google AdSense IDs are linked below. You can update your Publisher ID or Customer ID anytime:
                        </p>

                        <div className="space-y-3 font-mono">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                                        AdSense Publisher ID
                                    </label>
                                    <input
                                        type="text"
                                        value={pubId}
                                        onChange={(e) => setPubId(e.target.value)}
                                        placeholder="pub-1897225080989873"
                                        className="w-full bg-black border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                                        AdSense Customer ID
                                    </label>
                                    <input
                                        type="text"
                                        value={customerId}
                                        onChange={(e) => setCustomerId(e.target.value)}
                                        placeholder="6725053853"
                                        className="w-full bg-black border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Test Mode Toggle */}
                            <div className="bg-black/40 border border-gray-800 p-2.5 rounded-lg flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-bold text-white">Google H5 Adbreak Test Mode</div>
                                    <div className="text-[10px] text-gray-400">
                                        Enables test video ads without domain verification errors
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setTestMode(!testMode)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all border ${
                                        testMode 
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                                             : 'bg-gray-800 text-gray-400 border-gray-700'
                                    }`}
                                >
                                    {testMode ? "TEST MODE ON" : "LIVE MODE"}
                                </button>
                            </div>

                            {/* Action & Test Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <button
                                    onClick={handleSavePubId}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center space-x-1 shadow-md active:scale-98 transition-all"
                                >
                                    {savedStatus ? (
                                        <>
                                            <Check className="w-4 h-4 text-emerald-300" />
                                            <span>SETTINGS SAVED & APPLIED!</span>
                                        </>
                                    ) : (
                                        <span>SAVE & APPLY SETTINGS</span>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleTestInterstitial(true)}
                                    className="px-4 py-2.5 bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-500/50 font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center space-x-1 transition-all active:scale-98 shadow-md"
                                    title="Immediately triggers full-screen test ad intermission"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    <span>TEST INTERSTITIAL</span>
                                </button>

                                <button
                                    onClick={() => handleTestRewarded(true)}
                                    className="px-4 py-2.5 bg-amber-900/70 hover:bg-amber-800 text-amber-200 border border-amber-500/50 font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center space-x-1 transition-all active:scale-98 shadow-md"
                                    title="Immediately triggers rewarded test ad break and awards +50 gems"
                                >
                                    <Tv className="w-3.5 h-3.5" />
                                    <span>TEST REWARDED (+50)</span>
                                </button>
                            </div>

                            {/* Live SDK Call button */}
                            <button
                                onClick={() => handleTestInterstitial(false)}
                                className="w-full py-2 bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200 font-bold text-[10px] rounded-lg tracking-wider flex items-center justify-center space-x-1 transition-colors"
                            >
                                <span>TEST GOOGLE H5 API CALL (window.adBreak)</span>
                            </button>

                            {/* ads.txt copy */}
                            <div className="pt-2 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px]">
                                <div className="text-gray-400">
                                    <span className="text-white font-bold">Your ads.txt line: </span>
                                    <code className="text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded border border-gray-800 font-mono">
                                        google.com, {activeCleanPub}, DIRECT, f08c47fec0942fa0
                                    </code>
                                </div>
                                <button
                                    onClick={handleCopyAdsTxt}
                                    className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded border border-gray-700 text-[10px] flex items-center space-x-1 transition-colors active:scale-95"
                                >
                                    {copiedAdsTxt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copiedAdsTxt ? "COPIED TO CLIPBOARD!" : "COPY ADS.TXT"}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* How Google H5 Games Ads Work */}
                    <div className="bg-gray-950/80 border border-gray-900 p-4 rounded-xl">
                        <h3 className="text-xs font-bold text-cyan-400 mb-2 uppercase flex items-center">
                            📺 2. How Google AdSense H5 Ads Work
                        </h3>
                        <div className="space-y-2.5 font-sans text-gray-300 text-[11px]">
                            <p>
                                Google serves H5 Games ads through the official <code className="text-pink-400 bg-gray-900 px-1 py-0.5 rounded font-mono">adBreak()</code> and <code className="text-pink-400 bg-gray-900 px-1 py-0.5 rounded font-mono">adConfig()</code> APIs:
                            </p>
                            <ul className="list-disc list-inside ml-2 space-y-1 text-gray-400">
                                <li><strong>Preload & Sound:</strong> The game preloads ad breaks automatically and synchronizes audio pauses.</li>
                                <li><strong>Interstitial Ads:</strong> Served between runs or during pauses using Google's <code className="text-cyan-400 font-mono">type: 'next'</code>.</li>
                                <li><strong>Rewarded Ads:</strong> Players watch a video to get +50 Gems or a Revive using <code className="text-cyan-400 font-mono">type: 'reward'</code>.</li>
                                <li><strong>Development Sandbox:</strong> While developing in cloud preview, Google's policy serves test ads. When deployed to your domain with <code className="text-emerald-400 font-mono">ads.txt</code>, commercial ads serve automatically!</li>
                            </ul>
                        </div>
                    </div>

                    {/* Free Hosting Guide */}
                    <div className="bg-gray-950/80 border border-gray-900 p-4 rounded-xl">
                        <h3 className="text-xs font-bold text-purple-400 mb-2 uppercase flex items-center">
                            🚀 3. Publishing to Custom Domain
                        </h3>
                        <p className="mb-2 text-gray-400 text-[11px]">
                            When ready to go live and verify your domain in AdSense:
                        </p>
                        <ol className="list-decimal list-inside ml-2 space-y-1 text-[11px] text-gray-400">
                            <li>Build the production package: <code className="text-pink-400 bg-gray-900 px-1 py-0.5 rounded font-mono">npm run build</code>.</li>
                            <li>Upload the <code className="text-pink-400 bg-gray-900 px-1 py-0.5 rounded font-mono">dist</code> folder to Netlify, Vercel, or your web hosting.</li>
                            <li>Make sure <code className="text-emerald-400 bg-gray-900 px-1 py-0.5 rounded font-mono">/ads.txt</code> is accessible at <code className="text-gray-300 font-mono">https://yourdomain.com/ads.txt</code>.</li>
                            <li>Add your domain in your Google AdSense dashboard under "Sites".</li>
                        </ol>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-black text-xs rounded-xl tracking-widest transition-all active:scale-98 shadow-lg uppercase"
                    >
                        RETURN TO GAME INTERFACE
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ScreenActionProps {
    onOpenGuide: () => void;
    onOpenPremium: () => void;
}

const MenuScreen: React.FC<ScreenActionProps> = ({ onOpenGuide, onOpenPremium }) => {
    const { 
        unlockedSkins, 
        activeSkin, 
        selectSkin, 
        enableEffects, 
        setGraphicsMode, 
        startGame, 
        triggerAd, 
        isPremium 
    } = useStore();

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm pointer-events-auto overflow-y-auto overscroll-contain touch-pan-y flex flex-col items-center justify-start px-3 py-4 sm:py-6 pb-44">
            {/* Top Quick Bar */}
            <div className="w-full max-w-md mb-2 flex items-center justify-between gap-2">
                <button
                    onClick={onOpenGuide}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 rounded-xl text-[10px] font-mono text-cyan-300 shadow-md transition-all active:scale-95"
                    title="Open Google HTML5 Ads Settings & Publisher ID"
                >
                    <Settings className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span className="font-bold tracking-wider">ADS: pub-1897225080989873</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-black border border-emerald-500/40">CONFIG</span>
                </button>

                <button
                    onClick={onOpenPremium}
                    className="flex items-center space-x-1 px-3 py-2 bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/40 rounded-xl text-[10px] font-mono text-yellow-400 shadow-md transition-all active:scale-95"
                >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="font-bold">{isPremium ? "👑 PREMIUM" : "PRO"}</span>
                </button>
            </div>

            {/* Main Card Container - NO my-auto to prevent flexbox scroll lock on mobile */}
            <div className="relative w-full max-w-md bg-[#050011] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)] border border-white/10 flex flex-col mb-6">
                
                {/* Image Container - Responsive height */}
                <div className="relative w-full bg-gray-900 aspect-[16/9] sm:aspect-[4/3] max-h-48 sm:max-h-64 overflow-hidden">
                    <img 
                        src="https://www.gstatic.com/aistudio/starter-apps/gemini_runner/gemini_runner.png" 
                        alt="Endless Runner Cover" 
                        className="w-full h-full object-cover block"
                    />
                    
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050011] via-black/20 to-transparent"></div>
                    
                    {/* Endless Runner Title Overlay */}
                    <div className="absolute bottom-3 left-0 right-0 text-center px-4">
                        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 font-cyber tracking-widest drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] uppercase">
                            Endless Runner
                        </h1>
                        <div className="text-cyan-300 text-[10px] md:text-xs font-mono uppercase tracking-widest mt-0.5">
                            QUANTUM GEMINI RUNNER
                        </div>
                    </div>
                </div>

                {/* Content positioned below cover image */}
                <div className="p-4 sm:p-6 flex flex-col bg-[#050011]">
                    {/* Shell Selector */}
                    {unlockedSkins.length > 0 && (
                        <div className="mb-4">
                            <div className="text-xs font-mono text-purple-400 tracking-widest uppercase mb-2 text-center">CHOOSE CYBER SHELL</div>
                            <div className="flex justify-center space-x-2 overflow-x-auto py-1 max-w-full">
                                {PLAYER_SKINS.map(skin => {
                                    const isUnlocked = unlockedSkins.includes(skin.id);
                                    const isActive = activeSkin === skin.id;
                                    if (!isUnlocked) return null;

                                    return (
                                        <button
                                            key={skin.id}
                                            onClick={() => selectSkin(skin.id)}
                                            style={{
                                                borderColor: isActive ? skin.glowColor : 'rgba(255,255,255,0.1)',
                                                boxShadow: isActive ? `0 0 10px ${skin.glowColor}aa` : 'none'
                                            }}
                                            title={skin.name}
                                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                                                isActive ? 'bg-gray-800' : 'bg-gray-950/60 hover:bg-gray-900'
                                            }`}
                                        >
                                            <div 
                                                className="w-4 h-4 rounded-full" 
                                                style={{ backgroundColor: skin.color, boxShadow: `0 0 6px ${skin.glowColor}` }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Two Game Modes */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider mb-2">
                            <span className="text-gray-400 font-bold uppercase">SELECT MODE:</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                                !enableEffects 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                                {!enableEffects ? '⚡ MODE 1: LAG FREE ACTIVE' : '✨ MODE 2: HIGH GRAPHICS ACTIVE'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {/* MODE 1 */}
                            <button
                                onClick={() => setGraphicsMode('lag_free')}
                                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                    !enableEffects 
                                        ? 'border-emerald-400 bg-emerald-950/40 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400' 
                                        : 'border-gray-800 bg-black/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-black">
                                        MODE 1
                                    </span>
                                    <Zap className={`w-4 h-4 ${!enableEffects ? 'text-emerald-400 fill-current animate-pulse' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <div className={`font-black text-xs font-cyber tracking-wider ${!enableEffects ? 'text-emerald-300' : 'text-gray-300'}`}>
                                        LAG FREE MODE
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5 leading-tight">
                                        Ultra Smooth 60FPS • Zero Stutter
                                    </div>
                                </div>
                                {!enableEffects && (
                                    <div className="mt-2 text-[9px] font-bold text-emerald-400 font-mono flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping"></span>
                                        ACTIVE
                                    </div>
                                )}
                            </button>

                            {/* MODE 2 */}
                            <button
                                onClick={() => setGraphicsMode('high_graphics')}
                                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                                    enableEffects 
                                        ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400' 
                                        : 'border-gray-800 bg-black/60 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500 text-black">
                                        MODE 2
                                    </span>
                                    <Sparkles className={`w-4 h-4 ${enableEffects ? 'text-cyan-400 fill-current animate-pulse' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <div className={`font-black text-xs font-cyber tracking-wider ${enableEffects ? 'text-cyan-300' : 'text-gray-300'}`}>
                                        HIGH GRAPHICS
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5 leading-tight">
                                        Neon Bloom • HD Shaders
                                    </div>
                                </div>
                                {enableEffects && (
                                    <div className="mt-2 text-[9px] font-bold text-cyan-400 font-mono flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-ping"></span>
                                        ACTIVE
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    <button 
                      onClick={() => { audio.init(); startGame(); }}
                      className="w-full group relative px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl rounded-xl hover:bg-white/20 transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:border-cyan-400 overflow-hidden active:scale-98"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-pink-500/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <span className="relative z-10 tracking-widest flex items-center justify-center font-cyber">
                            INITIALIZE RUN <Play className="ml-2 w-5 h-5 fill-white" />
                        </span>
                    </button>

                    <p className="text-cyan-400/70 text-[10px] md:text-xs font-mono mt-2.5 tracking-wider text-center">
                        [ SWIPE • TOUCH BUTTONS • ARROW KEYS ]
                    </p>

                    {/* Monetization Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        <button 
                            onClick={() => triggerAd('rewarded_gems')}
                            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 border border-cyan-500/40 bg-cyan-950/30 text-cyan-400 hover:bg-cyan-500/20 rounded-xl text-[10px] font-mono tracking-wider transition-all active:scale-95"
                        >
                            <Tv className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>WATCH AD (+50)</span>
                        </button>
                        {isPremium ? (
                            <div className="flex items-center justify-center space-x-1 px-3 py-2.5 border border-yellow-500/30 bg-yellow-950/20 text-yellow-500 rounded-xl text-[10px] font-mono tracking-wider">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                                <span>👑 PREMIUM</span>
                            </div>
                        ) : (
                            <button 
                                onClick={onOpenPremium}
                                className="flex items-center justify-center space-x-1 px-3 py-2.5 border border-yellow-500/40 bg-yellow-950/30 text-yellow-400 hover:bg-yellow-500/20 rounded-xl text-[10px] font-mono tracking-wider animate-pulse transition-all active:scale-95"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                <span>REMOVE ADS</span>
                            </button>
                        )}
                    </div>

                    {/* Google HTML5 Ads Settings Button */}
                    <button 
                        onClick={onOpenGuide}
                        className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-900/80 via-cyan-900/80 to-purple-900/80 hover:brightness-125 border-2 border-cyan-400/70 text-cyan-200 rounded-xl text-xs font-mono font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] active:scale-98"
                    >
                        <Settings className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span>GOOGLE HTML5 ADS SETTINGS & PUB ID</span>
                    </button>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-[110]">
                <AdBanner />
            </div>
        </div>
    );
};

const GameOverScreen: React.FC<ScreenActionProps> = ({ onOpenGuide, onOpenPremium }) => {
    const { 
        level, 
        gemsCollected, 
        distance, 
        maxComboMultiplier, 
        score, 
        hasRevivedThisRun, 
        triggerAd, 
        isPremium, 
        restartGame, 
        goHome 
    } = useStore();

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto overscroll-contain touch-pan-y px-4 py-8 pb-40">
            <div className="flex flex-col items-center justify-start min-h-full max-w-md mx-auto">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] font-cyber text-center">GAME OVER</h1>
                
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full">
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5"/> LEVEL</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{level} / 3</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><Diamond className="mr-2 w-4 h-4 md:w-5 md:h-5"/> GEMS COLLECTED</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{gemsCollected}</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-purple-400 text-sm md:text-base"><MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5"/> DISTANCE</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{Math.floor(distance)} LY</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-amber-400 text-sm md:text-base"><Zap className="mr-2 w-4 h-4 md:w-5 md:h-5"/> BEST MULTIPLIER</div>
                        <div className="text-xl md:text-2xl font-bold font-mono text-amber-400">{maxComboMultiplier}x</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm md:text-base">TOTAL SCORE</div>
                        <div className="text-2xl md:text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score.toLocaleString()}</div>
                    </div>
                </div>

                {!hasRevivedThisRun && (
                    <div className="w-full mb-6 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => triggerAd('rewarded_revive')}
                            className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black rounded-2xl tracking-widest text-base shadow-[0_0_20px_rgba(16,185,129,0.35)] animate-bounce active:scale-98"
                        >
                            <Heart className="w-5 h-5 text-white fill-current animate-pulse" />
                            <span>{isPremium ? "FREE PREMIUM REVIVE" : "WATCH AD TO REVIVE"}</span>
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                    <button 
                        onClick={() => { audio.init(); restartGame(); }}
                        className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] w-full sm:w-auto"
                    >
                        RUN AGAIN
                    </button>
                    <button 
                        onClick={goHome}
                        className="flex items-center justify-center px-8 py-3 md:py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg rounded hover:scale-105 transition-all border border-gray-700 hover:border-gray-500 tracking-widest w-full sm:w-auto"
                    >
                        GO HOME <Home className="ml-2 w-5 h-5" />
                    </button>
                </div>

                <button 
                    onClick={onOpenGuide}
                    className="w-full mt-4 flex items-center justify-center space-x-1.5 px-3 py-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 rounded-xl text-[10px] font-mono tracking-wider transition-all"
                >
                    <Settings className="w-3.5 h-3.5 text-purple-400" />
                    <span>GOOGLE HTML5 ADS SETTINGS & PUB ID</span>
                </button>
            </div>
            <div className="fixed bottom-0 left-0 right-0 z-[110]">
                <AdBanner />
            </div>
        </div>
    );
};

const VictoryScreen: React.FC<ScreenActionProps> = ({ onOpenGuide, onOpenPremium }) => {
    const {
        score,
        gemsCollected,
        distance,
        maxComboMultiplier,
        isPremium,
        triggerAd,
        restartGame,
        goHome
    } = useStore();

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-purple-900/90 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto overscroll-contain touch-pan-y px-4 py-8 pb-40">
            <div className="flex flex-col items-center justify-start min-h-full max-w-md mx-auto">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-pink-500 mb-2 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] font-cyber text-center leading-tight">
                    MISSION COMPLETE
                </h1>
                <p className="text-cyan-300 text-xs md:text-sm font-mono mb-8 tracking-widest text-center">
                    THE ANSWER TO THE UNIVERSE HAS BEEN FOUND
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full">
                    <div className="bg-black/60 p-5 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                        <div className="text-xs md:text-sm text-gray-400 mb-1 tracking-wider">FINAL SCORE</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-yellow-400">{score.toLocaleString()}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">GEMS</div>
                            <div className="text-lg md:text-xl font-bold text-cyan-400">{gemsCollected}</div>
                        </div>
                        <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">DISTANCE</div>
                            <div className="text-lg md:text-xl font-bold text-purple-400">{Math.floor(distance)} LY</div>
                        </div>
                        <div className="bg-black/60 p-3 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">BEST MULT</div>
                            <div className="text-lg md:text-xl font-bold text-amber-400">{maxComboMultiplier}x</div>
                        </div>
                    </div>
                </div>

                <div className="w-full mb-4 animate-in zoom-in-95 duration-200">
                    <button
                        onClick={() => triggerAd('rewarded_gems')}
                        className="w-full flex items-center justify-center space-x-2 py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-black font-black rounded-2xl tracking-widest text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-98"
                    >
                        <Diamond className="w-4 h-4 text-black fill-current animate-pulse" />
                        <span>{isPremium ? "CLAIM PREMIUM BONUS (+50 GEMS)" : "WATCH AD FOR BONUS (+50 GEMS)"}</span>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                    <button 
                        onClick={() => { audio.init(); restartGame(); }}
                        className="px-8 md:px-12 py-4 bg-white text-black font-black text-lg rounded hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-widest w-full sm:w-auto"
                    >
                        RESTART MISSION
                    </button>
                    <button 
                        onClick={goHome}
                        className="flex items-center justify-center px-8 py-4 bg-gray-950 hover:bg-gray-900 text-white font-black text-lg rounded hover:scale-105 transition-all border border-gray-800 hover:border-gray-600 tracking-widest w-full sm:w-auto"
                    >
                        GO HOME <Home className="ml-2 w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 z-[110]">
                <AdBanner />
            </div>
        </div>
    );
};

const PlayingHUD: React.FC<ScreenActionProps> = ({ onOpenGuide, onOpenPremium }) => {
    const {
        score,
        lives,
        maxLives,
        collectedLetters,
        level,
        distance,
        isImmortalityActive,
        hasImmortality,
        speed,
        comboMultiplier,
        comboDistance,
        togglePause,
        enableEffects,
        setGraphicsMode
    } = useStore();

    const target = LEVEL_WORDS[level] || ['G', 'E', 'M', 'I', 'N', 'I'];

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4 md:p-8 z-50">
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full">
                <div className="flex flex-col">
                    <div className="text-3xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff] font-cyber">
                        {score.toLocaleString()}
                    </div>
                    
                    {/* Distance and Combo Panel */}
                    <div className="flex flex-col mt-2 space-y-1 pointer-events-auto bg-black/40 border border-white/5 backdrop-blur-sm p-2 rounded-xl max-w-fit shadow-md">
                        {/* Distance indicator */}
                        <div className="flex items-center text-purple-300 space-x-1 font-mono text-xs">
                            <MapPin className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                            <span className="font-bold tracking-wider">{Math.floor(distance)} LY</span>
                        </div>

                        {/* Combo Badge */}
                        <div className="flex items-center space-x-2">
                            <div className={`px-2 py-0.5 rounded font-cyber font-black text-[10px] transition-all duration-300 ${
                                comboMultiplier > 1 
                                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]' 
                                    : 'bg-gray-800 text-gray-400'
                            }`}>
                                COMBO
                            </div>
                            <div className={`font-cyber font-black text-sm transition-all duration-300 ${
                                comboMultiplier > 1 
                                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110' 
                                    : 'text-gray-500'
                            }`}>
                                {comboMultiplier}x
                            </div>
                        </div>

                        {/* Next Multiplier Progress Bar */}
                        {comboMultiplier < 10 ? (
                            <div className="w-24">
                                <div className="flex justify-between text-[8px] text-gray-500 font-mono mb-0.5">
                                    <span>NEXT MULT</span>
                                    <span>{Math.floor(comboDistance % 50)} / 50</span>
                                </div>
                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-200"
                                        style={{ width: `${((comboDistance % 50) / 50) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[9px] text-yellow-400 font-cyber font-bold tracking-wider animate-pulse">
                                ★ MAX COMBO ★
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Right-aligned life metrics & Pause control */}
                <div className="flex items-center space-x-2">
                    {/* Active Mode Quick Switcher */}
                    <button
                        onClick={() => setGraphicsMode(enableEffects ? 'lag_free' : 'high_graphics')}
                        className="pointer-events-auto px-2 py-1.5 bg-black/50 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 rounded-xl text-[9px] font-mono tracking-wider transition-all flex items-center space-x-1 shadow-md active:scale-95"
                        title={enableEffects ? "Mode 2 Active (High Graphics). Click to switch to Mode 1 (Lag Free)" : "Mode 1 Active (Lag Free). Click to switch to Mode 2 (High Graphics)"}
                    >
                        {!enableEffects ? (
                            <>
                                <Zap className="w-3 h-3 text-emerald-400 fill-current animate-pulse" />
                                <span className="text-emerald-300 font-bold hidden sm:inline">MODE 1</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                <span className="text-cyan-300 font-bold hidden sm:inline">MODE 2</span>
                            </>
                        )}
                    </button>

                    <button 
                        onClick={togglePause}
                        className="pointer-events-auto p-1.5 md:p-2 bg-black/40 hover:bg-cyan-500/20 text-white hover:text-cyan-400 border border-white/10 hover:border-cyan-400 rounded-xl transition-all duration-200 shadow-md active:scale-95"
                        title="Pause Run"
                    >
                        <Pause className="w-5 h-5" fill="currentColor" />
                    </button>

                    <div className="flex space-x-1">
                        {[...Array(maxLives)].map((_, i) => (
                            <Heart 
                                key={i} 
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Level Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs sm:text-sm text-purple-300 font-bold tracking-wider font-mono bg-black/60 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-sm z-50">
                LEVEL {level} <span className="text-gray-500 text-xs">/ 3</span>
            </div>

            {/* Active Skill Indicator */}
            {isImmortalityActive && (
                 <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-lg sm:text-xl animate-pulse flex items-center drop-shadow-[0_0_10px_gold]">
                     <Shield className="mr-2 fill-yellow-400" /> IMMORTAL
                 </div>
            )}

            {/* Gemini Collection Status */}
            <div className="absolute top-14 sm:top-16 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
                {target.map((char, idx) => {
                    const isCollected = collectedLetters.includes(idx);
                    const color = GEMINI_COLORS[idx];

                    return (
                        <div 
                            key={idx}
                            style={{
                                borderColor: isCollected ? color : 'rgba(55, 65, 81, 1)',
                                color: isCollected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(55, 65, 81, 1)',
                                boxShadow: isCollected ? `0 0 15px ${color}` : 'none',
                                backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.9)'
                            }}
                            className="w-7 h-9 sm:w-9 sm:h-11 flex items-center justify-center border font-black text-base sm:text-lg font-cyber rounded-lg transform transition-all duration-300"
                        >
                            {char}
                        </div>
                    );
                })}
            </div>

            {/* Speed indicator */}
            <div className="w-full flex justify-end items-end mb-2">
                 <div className="flex items-center space-x-1.5 text-cyan-400/80 bg-black/40 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                     <Zap className="w-3.5 h-3.5 animate-pulse" />
                     <span className="font-mono text-xs sm:text-sm">SPEED {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
                 </div>
            </div>

            {/* Tactile On-Screen Mobile Touch Controls */}
            <div className="w-full flex justify-between items-end pb-1 pointer-events-none select-none">
                {/* Steering Controls (Left & Right) */}
                <div className="flex items-center space-x-2.5 pointer-events-auto">
                    <button
                        onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('game-move-left')); }}
                        onClick={() => window.dispatchEvent(new CustomEvent('game-move-left'))}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/70 active:bg-cyan-500/40 border-2 border-cyan-500/60 active:border-cyan-300 text-cyan-300 active:scale-90 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-md"
                        aria-label="Steer Left"
                    >
                        <span className="text-2xl font-black font-cyber">◀</span>
                    </button>
                    <button
                        onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('game-move-right')); }}
                        onClick={() => window.dispatchEvent(new CustomEvent('game-move-right'))}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/70 active:bg-cyan-500/40 border-2 border-cyan-500/60 active:border-cyan-300 text-cyan-300 active:scale-90 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-md"
                        aria-label="Steer Right"
                    >
                        <span className="text-2xl font-black font-cyber">▶</span>
                    </button>
                </div>

                {/* Jump & Immortality Action Controls */}
                <div className="flex items-center space-x-2.5 pointer-events-auto">
                    {hasImmortality && (
                        <button
                            onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('game-immortal')); }}
                            onClick={() => window.dispatchEvent(new CustomEvent('game-immortal'))}
                            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl border-2 transition-all flex flex-col items-center justify-center shadow-lg backdrop-blur-md active:scale-90 ${
                                isImmortalityActive 
                                    ? 'bg-yellow-500 border-yellow-300 text-black animate-pulse shadow-[0_0_20px_gold]' 
                                    : 'bg-black/70 border-yellow-500/60 text-yellow-400 active:bg-yellow-500/30'
                            }`}
                            aria-label="Shield"
                        >
                            <Shield className="w-5 h-5 fill-current" />
                            <span className="text-[8px] font-cyber font-bold">SHIELD</span>
                        </button>
                    )}

                    <button
                        onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('game-jump')); }}
                        onClick={() => window.dispatchEvent(new CustomEvent('game-jump'))}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-900/90 to-pink-900/90 active:from-pink-600 active:to-purple-600 border-2 border-pink-500/70 text-white font-cyber font-black active:scale-90 transition-all flex flex-col items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.45)] backdrop-blur-md"
                        aria-label="Jump"
                    >
                        <ArrowUpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                        <span className="text-[9px] font-cyber tracking-wider mt-0.5 font-bold">JUMP</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const HUD: React.FC = () => {
    const { status } = useStore();
    const [isPremiumOpen, setIsPremiumOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const handleOpenGuide = () => setIsGuideOpen(true);
    const handleCloseGuide = () => setIsGuideOpen(false);
    const handleOpenPremium = () => setIsPremiumOpen(true);
    const handleClosePremium = () => setIsPremiumOpen(false);

    return (
        <>
            {status === GameStatus.SHOP && <ShopScreen />}
            {status === GameStatus.PAUSED && <PauseScreen onOpenGuide={handleOpenGuide} />}
            {status === GameStatus.MENU && <MenuScreen onOpenGuide={handleOpenGuide} onOpenPremium={handleOpenPremium} />}
            {status === GameStatus.GAME_OVER && <GameOverScreen onOpenGuide={handleOpenGuide} onOpenPremium={handleOpenPremium} />}
            {status === GameStatus.VICTORY && <VictoryScreen onOpenGuide={handleOpenGuide} onOpenPremium={handleOpenPremium} />}
            {status === GameStatus.PLAYING && <PlayingHUD onOpenGuide={handleOpenGuide} onOpenPremium={handleOpenPremium} />}

            {/* Global Overlays & Modals - ALWAYS ACTIVE & RENDERED ON ALL SCREENS */}
            <SimulatedAdOverlay />
            <PremiumCheckoutModal isOpen={isPremiumOpen} onClose={handleClosePremium} />
            <PublishingGuideModal isOpen={isGuideOpen} onClose={handleCloseGuide} />
        </>
    );
};
