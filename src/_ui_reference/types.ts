
import React from 'react';

export type UserRole = 'teacher' | 'student';

export type QuestionType = 
  | "multiple_choice" 
  | "fill_blank" 
  | "written" 
  | "poll" 
  | "true_false" 
  | "complete" 
  | "matching" 
  | "translate" 
  | "paragraph";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  subject?: string;
  experience?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  attempts: number;
  questionsCount: number;
  date: string;
  language: string;
  status: 'Published' | 'Draft';
  score?: number;
  timeTaken?: string;
  resultStatus?: 'Pass' | 'Distinction' | 'Failed';
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});
