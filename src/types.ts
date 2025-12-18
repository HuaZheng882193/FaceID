
export enum LabStep {
  INTRO = 'INTRO',
  RECOGNIZE = 'RECOGNIZE', // Observation of machine perception
  REMEMBER = 'REMEMBER',   // Face registration
  UNLOCK = 'UNLOCK',      // Simulation of access control
  REPORT = 'REPORT'       // Conclusion and result summary
}

export interface RecognitionResult {
  detected: boolean;
  landmarks: string[];
  description: string;
  confidence: number;
}

export interface EnrollmentData {
  name: string;
  faceImage: string; // base64
  timestamp: number;
}

export interface LabRecord {
  step: LabStep;
  observation: string;
  result: string;
}
