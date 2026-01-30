
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameState {
  score: number;
  highScore: number;
  credits: number;
  status: 'START' | 'DIFFICULTY_SELECT' | 'PLAYING' | 'GAME_OVER' | 'WIN' | 'NO_CREDITS';
  lastDeathReason: 'PIPE' | 'GROUND' | 'CEILING' | 'WIN' | null;
  aiCommentary: string;
  difficulty: Difficulty;
}

export interface Bird {
  y: number;
  velocity: number;
  rotation: number;
}

export interface BuildingDetails {
  color: string;
  windowColor: string;
  shapeType: 'standard' | 'stepped' | 'tapered' | 'notched' | 'antenna';
  hasWindows: boolean;
}

export interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
  verticalSpeed?: number;
  topBuilding: BuildingDetails;
  bottomBuilding: BuildingDetails;
}

export interface Theme {
  name: string;
  bg: string;
  pipeColor: string;
  birdColor: string;
}
