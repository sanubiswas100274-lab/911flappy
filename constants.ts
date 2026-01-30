
// Base game dimensions (internal logic runs at this resolution)
export const BASE_WIDTH = 400;
export const BASE_HEIGHT = 600;
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;
export const BIRD_SIZE = 30;

// Target frame rate for physics normalization (60 FPS)
export const TARGET_FPS = 60;
export const TARGET_FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms

export const CREDIT_COST = 9;
export const BOUNTY_REWARDS = {
  EASY: 12,
  MEDIUM: 15,
  HARD: 18
};

// Physics values normalized for 60 FPS
// These will be multiplied by deltaTime factor in the game loop
export const DIFFICULTY_SETTINGS = {
  EASY: {
    gravity: 0.12,
    jumpStrength: -4.5,
    pipeSpeed: 1.8,
    pipeSpawnRate: 140,
    pipeGap: 240,
  },
  MEDIUM: {
    gravity: 0.20,
    jumpStrength: -5.5,
    pipeSpeed: 2.5,
    pipeSpawnRate: 110,
    pipeGap: 210,
  },
  HARD: {
    gravity: 0.30,
    jumpStrength: -6.5,
    pipeSpeed: 3.8,
    pipeSpawnRate: 85,
    pipeGap: 175,
  }
};

export const THEMES = [
  { 
    name: 'Night Flight', 
    bg: '#020617', 
    pipeColor: '#1e293b', 
    birdColor: '#f8fafc', // White aeroplane for dark theme
    windowColor: 'rgba(253, 224, 71, 0.4)' 
  },
  { 
    name: 'Day Flight', 
    bg: '#bae6fd', 
    pipeColor: '#64748b', 
    birdColor: '#ef4444', // Red aeroplane for light theme
    windowColor: 'rgba(255, 255, 255, 0.6)'
  },
  { 
    name: 'Cyberpunk', 
    bg: '#2e1065', 
    pipeColor: '#4c1d95', 
    birdColor: '#22d3ee', 
    windowColor: 'rgba(34, 211, 238, 0.5)'
  },
  { 
    name: 'Industrial', 
    bg: '#292524', 
    pipeColor: '#1c1917', 
    birdColor: '#fbbf24', 
    windowColor: 'rgba(245, 158, 11, 0.3)'
  }
];
