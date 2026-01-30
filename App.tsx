
import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import Button from './components/Button';
import { GameState, Theme, Difficulty } from './types';
import { THEMES, CREDIT_COST, BOUNTY_REWARDS } from './constants';
import { getAICommentary } from './services/geminiService';

const CRITIC_NAMES = [
  "The Existential Crisis Generator",
  "Professional Disappointer",
  "The Digital Depressant",
  "Lord of the Skill Gap",
  "The Pavement Enthusiast",
  "CEO of Vertical Failure",
  "The Disappoint-o-Tron",
  "Gravity's Secret Agent",
  "The Flight Path Violator",
  "The Unscheduled Disassembly Expert",
  "Rapid Unplanned Dismantler",
  "The Crash Test Dummy Overseer",
  "Sentient Disappointment Engine",
  "The Mechanical Eye-Roller"
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedCredits = localStorage.getItem('skylineCredits');
    return {
      score: 0,
      highScore: parseInt(localStorage.getItem('flappyHighScore') || '0'),
      credits: savedCredits ? parseInt(savedCredits) : 90,
      status: 'START',
      lastDeathReason: null,
      aiCommentary: "Welcome to the air traffic nightmare. Try not to embarrass the pilot association.",
      difficulty: 'MEDIUM'
    };
  });
  
  const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [currentCriticName, setCurrentCriticName] = useState(CRITIC_NAMES[0]);

  // Sync credits to localStorage
  useEffect(() => {
    localStorage.setItem('skylineCredits', gameState.credits.toString());
  }, [gameState.credits]);

  const selectDifficulty = (diff: Difficulty) => {
    if (gameState.credits < CREDIT_COST) {
      setGameState(prev => ({ ...prev, status: 'NO_CREDITS' }));
      return;
    }

    setGameState(prev => ({
      ...prev,
      difficulty: diff,
      status: 'PLAYING',
      score: 0,
      credits: prev.credits - CREDIT_COST,
      lastDeathReason: null
    }));
  };

  const resetToMenu = () => {
    setGameState(prev => ({
      ...prev,
      status: 'START',
      score: 0,
      lastDeathReason: null
    }));
  };

  const requestBailout = () => {
    setGameState(prev => ({
      ...prev,
      credits: 45,
      status: 'START'
    }));
  };

  const goToDifficultySelect = () => {
    if (gameState.credits < CREDIT_COST) {
      setGameState(prev => ({ ...prev, status: 'NO_CREDITS' }));
      return;
    }
    setGameState(prev => ({ ...prev, status: 'DIFFICULTY_SELECT' }));
  };

  const handleGameOver = useCallback(async (finalScore: number, reason: 'PIPE' | 'GROUND' | 'CEILING' | 'WIN') => {
    const randomName = CRITIC_NAMES[Math.floor(Math.random() * CRITIC_NAMES.length)];
    setCurrentCriticName(randomName);

    setGameState(prev => {
      const isNewHigh = finalScore > prev.highScore;
      const isWin = reason === 'WIN';
      const bountyAward = isWin ? BOUNTY_REWARDS[prev.difficulty] : 0;
      
      if (isNewHigh) {
        localStorage.setItem('flappyHighScore', finalScore.toString());
      }

      return {
        ...prev,
        status: isWin ? 'WIN' : 'GAME_OVER',
        score: finalScore,
        highScore: isNewHigh ? finalScore : prev.highScore,
        credits: prev.credits + bountyAward,
        lastDeathReason: reason
      };
    });

    setLoadingAI(true);
    const commentary = await getAICommentary(finalScore, reason);
    setGameState(prev => ({ ...prev, aiCommentary: commentary }));
    setLoadingAI(false);
  }, []);

  const handleScoreUpdate = useCallback((score: number) => {
    setGameState(prev => ({ ...prev, score }));
  }, []);

  const Wallet = () => (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 sm:gap-3 bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-zinc-700 shadow-xl z-50">
      <div className="flex flex-col items-end">
        <span className="text-[8px] sm:text-[10px] uppercase font-black text-zinc-500 leading-none">Bounty Fuel</span>
        <span className="text-sm sm:text-xl font-black text-yellow-400 leading-tight tracking-tighter">{gameState.credits}</span>
      </div>
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)]">
        <i className="fa-solid fa-bolt text-black text-sm sm:text-lg"></i>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 transition-colors duration-700 ${activeTheme.name === 'Day Flight' ? 'bg-sky-100' : 'bg-zinc-950'} text-white select-none overflow-hidden font-sans`}>
      
      {gameState.status !== 'PLAYING' && <Wallet />}

      <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[440px] lg:max-w-[500px]">
        <GameCanvas 
          status={gameState.status === 'NO_CREDITS' ? 'START' : (gameState.status as any)}
          theme={activeTheme}
          difficulty={gameState.difficulty}
          onGameOver={handleGameOver}
          onScoreUpdate={handleScoreUpdate}
          onJump={() => {}}
        />

        {gameState.status === 'PLAYING' && (
          <div className="absolute top-6 sm:top-8 md:top-10 left-1/2 -translate-x-1/2 pointer-events-none text-center">
            <div className="text-4xl sm:text-5xl md:text-7xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] animate-pulse">
              {gameState.score}
            </div>
            <div className="text-[7px] sm:text-[8px] md:text-[10px] uppercase font-bold text-white/60 tracking-[0.2em] sm:tracking-[0.3em]">Objective: 30</div>
          </div>
        )}

        {gameState.status === 'START' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[24px] sm:rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-4 sm:mb-6 md:mb-8">
               <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 italic leading-none tracking-tighter">
                 SKYLINE<br/>STRIKE
               </h1>
               <div className="h-0.5 sm:h-1 w-full bg-yellow-500 mt-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
            </div>
            
            <div className="bg-zinc-900/90 p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 md:mb-8 border border-zinc-700 w-full max-w-[240px] sm:max-w-[280px] shadow-2xl">
              <p className="text-zinc-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-widest mb-1">Pre-Flight Briefing</p>
              <p className="text-xs sm:text-sm md:text-base text-zinc-200 italic font-medium leading-tight">"{gameState.aiCommentary}"</p>
            </div>

            <Button onClick={goToDifficultySelect} className="w-full max-w-[180px] sm:max-w-[220px] text-lg sm:text-xl md:text-2xl py-3 sm:py-4 md:py-5 group bg-white hover:bg-zinc-200 text-black border-zinc-400">
              <div className="flex flex-col items-center">
                <span className="flex items-center gap-2"><i className="fa-solid fa-plane-up group-hover:translate-y-[-4px] transition-transform"></i> TAKE OFF</span>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-zinc-500 mt-1">Cost: {CREDIT_COST} Fuel</span>
              </div>
            </Button>
            
            <div className="mt-4 sm:mt-6 md:mt-8">
               <p className="text-[9px] sm:text-[10px] text-zinc-400 mb-2 sm:mb-3 uppercase tracking-widest font-black">Environment</p>
               <div className="flex gap-2 sm:gap-3 md:gap-4 justify-center">
                  {THEMES.map(t => (
                    <button 
                      key={t.name}
                      onClick={() => setActiveTheme(t)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl border-2 sm:border-2 md:border-4 transition-all transform hover:scale-110 flex items-center justify-center ${activeTheme.name === t.name ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] scale-105' : 'border-zinc-700 opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: t.bg }}
                    >
                        {t.name === 'Night Flight' && <i className="fa-solid fa-moon text-white text-xs sm:text-sm md:text-base"></i>}
                        {t.name === 'Day Flight' && <i className="fa-solid fa-sun text-yellow-400 text-xs sm:text-sm md:text-base"></i>}
                        {t.name === 'Cyberpunk' && <i className="fa-solid fa-bolt text-cyan-400 text-xs sm:text-sm md:text-base"></i>}
                        {t.name === 'Industrial' && <i className="fa-solid fa-gears text-zinc-400 text-xs sm:text-sm md:text-base"></i>}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {gameState.status === 'DIFFICULTY_SELECT' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-[24px] sm:rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 text-center animate-in slide-in-from-bottom duration-300">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6 md:mb-8 italic text-white uppercase tracking-tighter">Mission Difficulty</h2>
            
            <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 w-full max-w-[220px] sm:max-w-[260px] md:max-w-[280px]">
              <button onClick={() => selectDifficulty('EASY')} className="group relative bg-emerald-500/20 hover:bg-emerald-500/40 border-2 border-emerald-500/50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all text-left">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-emerald-400">CADET</span>
                  <span className="text-[8px] sm:text-[9px] font-black bg-emerald-500 text-black px-1.5 sm:px-2 py-0.5 rounded">+{BOUNTY_REWARDS.EASY}</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-emerald-200/60 uppercase font-bold">Safe skies. Low turbulence.</p>
              </button>

              <button onClick={() => selectDifficulty('MEDIUM')} className="group relative bg-sky-500/20 hover:bg-sky-500/40 border-2 border-sky-500/50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all text-left">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-sky-400">PILOT</span>
                  <span className="text-[8px] sm:text-[9px] font-black bg-sky-500 text-black px-1.5 sm:px-2 py-0.5 rounded">+{BOUNTY_REWARDS.MEDIUM}</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-sky-200/60 uppercase font-bold">Standard air traffic control.</p>
              </button>

              <button onClick={() => selectDifficulty('HARD')} className="group relative bg-red-600/30 hover:bg-red-600/50 border-2 border-red-500 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl transition-all text-left overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-red-500 italic">ACE</span>
                  <span className="text-[8px] sm:text-[9px] font-black bg-red-500 text-black px-1.5 sm:px-2 py-0.5 rounded">+{BOUNTY_REWARDS.HARD}</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-red-200 uppercase font-bold">Moving structures. Wind shear.</p>
              </button>
            </div>

            <button onClick={() => setGameState(prev => ({...prev, status: 'START'}))} className="mt-4 sm:mt-6 md:mt-8 text-zinc-500 hover:text-white uppercase text-[9px] sm:text-[10px] font-bold tracking-widest transition-colors">
              <i className="fa-solid fa-arrow-left mr-2"></i> ABORT MISSION
            </button>
          </div>
        )}

        {gameState.status === 'NO_CREDITS' && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-xl rounded-[24px] sm:rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center animate-in zoom-in duration-300">
             <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-bounce">
                <i className="fa-solid fa-plug-circle-xmark text-white text-2xl sm:text-3xl md:text-4xl"></i>
             </div>
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Grounded</h2>
             <p className="text-red-200 text-[10px] sm:text-xs md:text-sm mb-6 sm:mb-8 leading-relaxed px-2">
               You've run out of Bounty Fuel. Your pilot license has been temporarily suspended due to extreme incompetence.
             </p>
             <Button onClick={requestBailout} className="w-full max-w-[200px] sm:max-w-none bg-white text-black hover:bg-zinc-200 text-xs sm:text-sm md:text-base" variant="primary">
               REQUEST BAILOUT (45 Fuel)
             </Button>
          </div>
        )}

        {gameState.status === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center animate-in zoom-in duration-300">
            <div className="mb-3 sm:mb-4">
               <h2 className="text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.7)]">
                 BLASTED!
               </h2>
               <p className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-bold mt-1 tracking-[0.2em]">
                 CRASH SITE: {gameState.difficulty}
               </p>
            </div>
            
            <div className="flex gap-2 sm:gap-3 md:gap-4 w-full mb-4 sm:mb-6">
              <div className="flex-1 bg-zinc-900 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-zinc-800">
                <p className="text-[7px] sm:text-[8px] md:text-[10px] text-zinc-600 uppercase font-black">Score</p>
                <p className="text-xl sm:text-2xl md:text-4xl font-black text-white">{gameState.score}</p>
              </div>
              <div className="flex-1 bg-zinc-900 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-zinc-800">
                <p className="text-[7px] sm:text-[8px] md:text-[10px] text-zinc-600 uppercase font-black">Peak</p>
                <p className="text-xl sm:text-2xl md:text-4xl font-black text-yellow-500">{gameState.highScore}</p>
              </div>
            </div>

            <div className="bg-zinc-800/80 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 md:mb-8 border-l-4 sm:border-l-8 w-full relative border-red-600">
               {loadingAI && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-xl sm:rounded-2xl">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               )}
              <p className="text-[7px] sm:text-[8px] uppercase font-black mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-red-500">
                <i className="fa-solid fa-tower-broadcast animate-pulse"></i> {currentCriticName}
              </p>
              <p className="text-sm sm:text-base md:text-lg text-zinc-100 italic font-serif leading-tight">
                "{gameState.aiCommentary}"
              </p>
            </div>

            <Button onClick={resetToMenu} className="w-full text-lg sm:text-xl md:text-2xl py-3 sm:py-4 md:py-5 mb-3 sm:mb-4 border-b-4 sm:border-b-8 bg-red-600 hover:bg-red-700 border-red-900 text-white" variant="primary">
              <i className="fa-solid fa-rotate-right"></i> TRY AGAIN
            </Button>
            
            <div className="flex gap-2 sm:gap-3 w-full">
                <Button onClick={goToDifficultySelect} className="flex-1 text-[9px] sm:text-[10px] py-1.5 sm:py-2 opacity-70 hover:opacity-100 bg-zinc-800 text-white border-zinc-950" variant="secondary">
                   SETTINGS
                </Button>
                <Button onClick={() => setGameState(prev => ({...prev, status: 'START'}))} className="flex-1 text-[9px] sm:text-[10px] py-1.5 sm:py-2 opacity-50 hover:opacity-100 bg-zinc-800 text-white border-zinc-950" variant="secondary">
                   MENU
                </Button>
            </div>
          </div>
        )}

        {gameState.status === 'WIN' && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl rounded-[24px] sm:rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center animate-in zoom-in duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-green-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_40px_rgba(34,197,94,0.6)] animate-bounce">
                <i className="fa-solid fa-trophy text-white text-2xl sm:text-3xl md:text-5xl"></i>
            </div>

            <div className="mb-4 sm:mb-6">
               <h2 className="text-3xl sm:text-4xl md:text-6xl font-black italic tracking-tighter text-green-500">
                 LANDED!
               </h2>
               <div className="mt-3 sm:mt-4 bg-zinc-900/80 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-green-500/30">
                  <p className="text-zinc-500 text-[7px] sm:text-[8px] md:text-[10px] uppercase font-black tracking-widest mb-1">Mission Bounty Credited</p>
                  <p className="text-xl sm:text-2xl md:text-4xl font-black text-white">+{BOUNTY_REWARDS[gameState.difficulty]} <span className="text-yellow-400 text-xs sm:text-sm md:text-lg uppercase">Fuel</span></p>
               </div>
            </div>
            
            <div className="bg-zinc-800/80 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 md:mb-8 border-l-4 sm:border-l-8 w-full relative border-green-500">
               {loadingAI && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-xl sm:rounded-2xl">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               )}
              <p className="text-[7px] sm:text-[8px] uppercase font-black mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-green-400">
                <i className="fa-solid fa-tower-broadcast animate-pulse"></i> {currentCriticName}
              </p>
              <p className="text-sm sm:text-base md:text-lg text-zinc-100 italic font-serif leading-tight">
                "{gameState.aiCommentary}"
              </p>
            </div>

            <div className="w-full flex flex-col gap-3 sm:gap-4">
               <Button onClick={resetToMenu} className="w-full text-base sm:text-lg md:text-xl py-2.5 sm:py-3 md:py-4 bg-zinc-100 hover:bg-zinc-300 text-black" variant="primary">
                  RETURN TO MENU
               </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col items-center gap-2 opacity-40">
        <div className="flex gap-4 text-[7px] sm:text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em] sm:tracking-[0.4em]">
           <div className="flex items-center gap-2 text-center">REACH 30 TO RETIRE IN PEACE</div>
        </div>
      </div>
    </div>
  );
};

export default App;
