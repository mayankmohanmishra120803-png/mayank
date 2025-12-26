
export interface Question {
  id: string;
  category: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  originalLanguage?: string;
}

export type UserRole = 'student' | 'owner';

export interface TestConfig {
  className: string;
  subject: string;
  chapters: string[];
  questionCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  competition: string;
}

export interface Attempt {
  questionId: string;
  isCorrect: boolean;
  round: number;
  timestamp: number;
  userSelection?: number;
}

export interface TestResult {
  id: string;
  studentName: string;
  config: TestConfig;
  attempts: Attempt[];
  startTime: number;
  endTime: number;
  oneShotAccuracy: number;
}

export interface MasteryAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  cognitiveSummary: string;
}

export interface QuizState {
  config: TestConfig;
  studentName: string;
  activePool: Question[];
  incorrectQueue: Question[];
  currentIdx: number;
  roundNumber: number;
  attempts: Attempt[];
  startTime: number;
  questions: Question[];
  isPaused: boolean;
  language: string;
}
