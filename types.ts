export enum InterviewStage {
  SETUP,
  PRE_INTERVIEW,
  IN_INTERVIEW,
  ANALYSIS,
}

export interface Candidate {
  name: string;
  resumeHighlights: string[];
}

export interface Job {
  description: string;
}

export interface TranscriptEntry {
  speaker: 'user' | 'model';
  text: string;
}

export interface Score {
  score: number; // Score from 0 to 100
  reasoning: string;
}

export interface EmotionAnalysis {
  summary: string;
  dominantEmotion: string;
}

export interface Analysis {
  overallImpression: string;
  confidence: Score;
  expressiveness: Score;
  knowledge: Score;
  communicationSkills: Score;
  strengths: string[];
  areasForImprovement: string[];
  emotionAnalysis: EmotionAnalysis;
}