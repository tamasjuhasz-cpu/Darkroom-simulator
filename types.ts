
export enum AppStage {
  CAMERA = 'CAMERA',
  DARKROOM = 'DARKROOM',
  DRYING = 'DRYING',
  FINISHED = 'FINISHED'
}

export enum BathType {
  DEVELOPER = 'DEVELOPER',
  STOP = 'STOP',
  FIXER = 'FIXER',
  WASH = 'WASH'
}

export enum ExposureLevel {
  UNDER = 'UNDER',
  CORRECT = 'CORRECT',
  OVER = 'OVER'
}

export enum PaperType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE'
}

export interface BathInfo {
  id: BathType;
  name: string;
  color: string;
  description: string;
  chemistry: string;
  microView: string;
  optimalTime: number; // seconds
}

export interface PhotoState {
  isExposed: boolean;
  exposureTime: number;
  exposureLevel: ExposureLevel;
  paperType: PaperType;
  developmentLevel: number; // 0 to 1
  fixTime: number; 
  isFixed: boolean;
  isStopped: boolean;
  isWashed: boolean;
  isDry: boolean;
  baseImageUrl?: string; 
  sceneDescription?: string;
  isPoorlyFixed?: boolean;
  // Stats for the end screen
  bathTimers?: Record<BathType, number>;
}
