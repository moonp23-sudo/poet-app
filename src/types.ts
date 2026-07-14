export type Language = 'ko' | 'en' | 'vi' | 'zh' | 'ja';

export interface SubjectItem {
  id: string;
  name: string;
  emoji: string;
  isCorrect: boolean;
  hint: string;
}

export interface Choice {
  id: string;
  text: string;
  emoji: string;
  isCorrect: boolean;
}

export interface AcademicQuestion {
  word: string;          // e.g., "비교" (Compare)
  simplifiedWord: string; // e.g., "공통점과 차이점 찾기" (Finding similarities and differences)
  questionText: string;   // Simplified question
  choices: Choice[];
  guideline: string;      // Guidance context
}

export interface SentenceCard {
  id: string;
  text: string;
  category: 'subject' | 'action' | 'feeling';
  order: number; // 1: Subject, 2: Action, 3: Feeling
}

export interface PoemTranslation {
  title: string;
  content: string[];
  guide: string;
  homeworkGuide: string;
}

export interface Poem {
  id: string;
  title: string;
  author: string;
  content: string[];
  subjects: SubjectItem[];
  academicQuestion: AcademicQuestion;
  sentenceCards: SentenceCard[];
  correctSequence: string[]; // Order of Card IDs to make the perfect sentence
  translations: Record<Exclude<Language, 'ko'>, PoemTranslation>;
}

export interface EvaluationLog {
  poemId: string;
  poemTitle: string;
  step1Completed: boolean;
  step1Tries: number;
  step1SelectedWrong: string[];
  step2Completed: boolean;
  step2SelectedChoiceId?: string;
  step3Completed: boolean;
  step3Tries: number;
  stampsEarned: number; // 0 to 3
  teacherObservation: string;
  updatedAt: string;
}
