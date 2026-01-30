
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  BIRD_SIZE,
  DIFFICULTY_SETTINGS
} from '../constants';
import { Bird, Pipe, Theme, Difficulty, BuildingDetails } from '../types';

interface GameCanvasProps {
  status: 'START' | 'DIFFICULTY_SELECT' | 'PLAYING' | 'GAME_OVER' | 'WIN';
  theme: Theme & { windowColor?: string };
  difficulty: Difficulty;
  onGameOver: (score: number, reason: 'PIPE' | 'GROUND' | 'CEILING' | 'WIN') => void;
  onScoreUpdate: (score: number) => void;
  onJump: () => void;
}

const BUILDING_PALETTE = [
  '#1e293b', '#334155', '#475569', 
  '#3f3f46', '#27272a', '#18181b', 
  '#44403c', '#292524', '#1c1917', 
  '#374151', '#1f2937', '#111827'
];

const WINDOW_PALETTE = [
  'rgba(253, 224, 71, 0.4)', 
  'rgba(255, 255, 255, 0.3)', 
  'rgba(186, 230, 253, 0.4)', 
  'rgba(254, 240, 138, 0.2)'
];

const GameCanvas: React.FC<GameCanvasProps> = ({ status, theme, difficulty, onGameOver, onScoreUpdate, onJump }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bird, setBird] = useState<Bird>({ y: GAME_HEIGHT / 2, velocity: 0, rotation: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  
  const settings = DIFFICULTY_SETTINGS[difficulty];

  const stateRef = useRef({
    bird: { y: GAME_HEIGHT / 2, velocity: 0, rotation: 0 },
    pipes: [] as Pipe[],
    score: 0,
    frameCount: 0,
    status: status,
    currentPipeSpeed: settings.pipeSpeed,
    parallaxX: 0
  });

  useEffect(() => {
    stateRef.current.status = status;
    if (status === 'START' || status === 'DIFFICULTY_SELECT') {
      stateRef.current = {
        bird: { y: GAME_HEIGHT / 2, velocity: 0, rotation: 0 },
        pipes: [],
        score: 0,
        frameCount: 0,
        status: status,
        currentPipeSpeed: settings.pipeSpeed,
        parallaxX: 0
      };
      setBird(stateRef.current.bird);
      setPipes(stateRef.current.pipes);
    }
  }, [status, settings.pipeSpeed]);

  const jump = useCallback(() => {
    if (stateRef.current.status !== 'PLAYING') return;
    stateRef.current.bird.velocity = settings.jumpStrength;
    onJump();
  }, [onJump, settings.jumpStrength]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  const update = useCallback(() => {
    if (stateRef.current.status !== 'PLAYING') return;

    const { bird, pipes, frameCount, score } = stateRef.current;

    if (score >= 30) {
      onGameOver(30, 'WIN');
      return;
    }

    if (difficulty === 'HARD') {
      if (frameCount % 60 === 0) {
        stateRef.current.currentPipeSpeed = settings.pipeSpeed * (0.8 + Math.random() * 0.7);
      }
    } else {
      stateRef.current.currentPipeSpeed = settings.pipeSpeed;
    }

    bird.velocity += settings.gravity;
    bird.y += bird.velocity;
    bird.rotation = Math.min(Math.PI / 8, Math.max(-Math.PI / 4, bird.velocity * 0.05));

    if (bird.y - BIRD_SIZE / 2 < 0) {
      onGameOver(stateRef.current.score, 'CEILING');
      return;
    }
    if (bird.y + BIRD_SIZE / 2 >= GAME_HEIGHT) {
      onGameOver(stateRef.current.score, 'GROUND');
      return;
    }

    stateRef.current.parallaxX += stateRef.current.currentPipeSpeed * 0.4;
    stateRef.current.pipes = pipes
      .map(p => {
        let newY = p.topHeight;
        if (difficulty === 'HARD' && p.verticalSpeed) {
            newY += p.verticalSpeed;
            if (newY < 100 || newY > GAME_HEIGHT - settings.pipeGap - 100) {
                p.verticalSpeed *= -1;
            }
        }
        return { ...p, x: p.x - stateRef.current.currentPipeSpeed, topHeight: newY };
      })
      .filter(p => p.x + 100 > -100);

    if (frameCount % settings.pipeSpawnRate === 0) {
      const topHeight = Math.random() * (GAME_HEIGHT - settings.pipeGap - 200) + 100;
      const verticalSpeed = difficulty === 'HARD' ? (Math.random() - 0.5) * 2.5 : 0;
      
      const getRandomBuilding = (): BuildingDetails => ({
        color: BUILDING_PALETTE[Math.floor(Math.random() * BUILDING_PALETTE.length)],
        windowColor: WINDOW_PALETTE[Math.floor(Math.random() * WINDOW_PALETTE.length)],
        shapeType: (['standard', 'stepped', 'tapered', 'notched', 'antenna'] as any)[Math.floor(Math.random() * 5)],
        hasWindows: Math.random() > 0.1
      });

      stateRef.current.pipes.push({ 
        x: GAME_WIDTH + 100, 
        topHeight, 
        passed: false, 
        verticalSpeed,
        topBuilding: getRandomBuilding(),
        bottomBuilding: getRandomBuilding()
      });
    }

    stateRef.current.pipes.forEach(p => {
      const pipeWidth = 70;
      const birdLeft = 50 - BIRD_SIZE / 2;
      const birdRight = 50 + BIRD_SIZE / 2;
      const birdTop = bird.y - BIRD_SIZE / 4;
      const birdBottom = bird.y + BIRD_SIZE / 4;

      if (birdRight > p.x && birdLeft < p.x + pipeWidth) {
        if (birdTop < p.topHeight || birdBottom > p.topHeight + settings.pipeGap) {
          onGameOver(stateRef.current.score, 'PIPE');
        }
      }

      if (!p.passed && p.x + pipeWidth < 50) {
        p.passed = true;
        stateRef.current.score += 1;
        onScoreUpdate(stateRef.current.score);
      }
    });

    stateRef.current.frameCount++;
    setBird({ ...bird });
    setPipes([...stateRef.current.pipes]);
  }, [onGameOver, onScoreUpdate, settings, difficulty]);

  const drawAirplane2D = (ctx: CanvasRenderingContext2D) => {
    const color = theme.birdColor;
    
    // Fuselage
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-20, -6, 35, 12, 6);
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.roundRect(5, -4, 8, 4, 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(-2, -2, 6, 12, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail
    ctx.beginPath();
    ctx.moveTo(-18, -4);
    ctx.lineTo(-25, -12);
    ctx.lineTo(-20, -4);
    ctx.closePath();
    ctx.fill();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    bgGrad.addColorStop(0, theme.bg);
    bgGrad.addColorStop(1, theme.name === 'Day Flight' ? '#7dd3fc' : '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Stars or simple clouds in background
    if (theme.name === 'Night Flight' || theme.name === 'Cyberpunk') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for(let i=0; i<20; i++) {
            const x = (i * 137 - stateRef.current.parallaxX * 0.05) % GAME_WIDTH;
            const y = (i * 223) % GAME_HEIGHT;
            ctx.fillRect(x < 0 ? x + GAME_WIDTH : x, y, 2, 2);
        }
    }

    // Pipes (2D Buildings)
    pipes.forEach(p => {
      const pipeWidth = 70;

      const render2DBuilding = (x: number, y: number, w: number, h: number, details: BuildingDetails, isTop: boolean) => {
        ctx.save();
        
        // Base Rectangle
        ctx.fillStyle = details.color;
        ctx.fillRect(x, isTop ? 0 : y, w, h);

        // Simple Shading (Left side darker for flat 2D depth)
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(x, isTop ? 0 : y, 10, h);

        // Architectural Details
        ctx.fillStyle = details.color;
        if (details.shapeType === 'stepped') {
           const step = 12;
           if (isTop) {
               ctx.fillRect(x + step, y, w - step * 2, 10);
           } else {
               ctx.fillRect(x + step, y - 10, w - step * 2, 10);
           }
        } else if (details.shapeType === 'tapered') {
           const t = 15;
           ctx.beginPath();
           if (isTop) {
             ctx.moveTo(x, y); ctx.lineTo(x + t, y + 15); ctx.lineTo(x + w - t, y + 15); ctx.lineTo(x + w, y);
           } else {
             ctx.moveTo(x, y); ctx.lineTo(x + t, y - 15); ctx.lineTo(x + w - t, y - 15); ctx.lineTo(x + w, y);
           }
           ctx.closePath();
           ctx.fill();
        } else if (details.shapeType === 'notched') {
            const n = 8;
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            if (isTop) {
                ctx.fillRect(x, y-n, n, n);
                ctx.fillRect(x+w-n, y-n, n, n);
            } else {
                ctx.fillRect(x, y, n, n);
                ctx.fillRect(x+w-n, y, n, n);
            }
        }

        // Windows
        if (details.hasWindows) {
           ctx.fillStyle = details.windowColor;
           const winW = 4;
           const winH = 6;
           const startY = isTop ? 20 : y + 20;
           const endY = isTop ? y - 20 : GAME_HEIGHT - 20;
           
           for(let wx = x + 15; wx < x + w - 10; wx += 14) {
             for(let wy = startY; wy < endY; wy += 18) {
               if ((Math.floor(wx * 2 + wy + p.x / 4)) % 7 !== 0) {
                   ctx.fillRect(wx, wy, winW, winH);
               }
             }
           }
        }

        // Antenna
        if (!isTop && details.shapeType === 'antenna') {
            ctx.fillStyle = '#000';
            ctx.fillRect(x + w/2 - 1, y - 25, 2, 25);
            ctx.fillStyle = 'red';
            if (stateRef.current.frameCount % 60 < 30) {
                ctx.beginPath();
                ctx.arc(x + w/2, y - 28, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
      };

      render2DBuilding(p.x, p.topHeight, pipeWidth, p.topHeight, p.topBuilding, true);
      render2DBuilding(p.x, p.topHeight + settings.pipeGap, pipeWidth, GAME_HEIGHT - (p.topHeight + settings.pipeGap), p.bottomBuilding, false);
    });

    // Bird (Airplane)
    ctx.save();
    ctx.translate(50, bird.y);
    ctx.rotate(bird.rotation);
    drawAirplane2D(ctx);
    ctx.restore();

    // UI Overlay Score (Mini)
    if (status === 'PLAYING') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(`TARGET: 30`, 20, 30);
    }
  }, [bird, pipes, theme, status, difficulty, settings.pipeGap]);

  useEffect(() => {
    let animationFrame: number;
    const loop = () => { update(); draw(); animationFrame = requestAnimationFrame(loop); };
    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [update, draw]);

  return (
    <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT}
      onMouseDown={(e) => { e.preventDefault(); jump(); }}
      onTouchStart={(e) => { e.preventDefault(); jump(); }}
      className="max-w-full h-auto cursor-pointer rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[12px] border-zinc-900 bg-black"
    />
  );
};

export default GameCanvas;
