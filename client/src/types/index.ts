export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'technician' | 'trainee' | 'admin';
  credential_code?: string;
  is_active: boolean;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  training_path: 'operator' | 'technician';
  duration_minutes: number;
  order_index: number;
  thumbnail_url?: string;
  video_url?: string;
  user_status?: 'not_started' | 'in_progress' | 'completed';
  progress_percentage?: number;
  quiz_score?: number;
  quiz_passed?: boolean;
}

export interface TrainingContent {
  id: string;
  module_id: string;
  section_title: string;
  section_content: string;
  section_type: 'text' | 'video' | 'image' | 'checklist';
  order_index: number;
  video_url?: string;
  image_url?: string;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: QuizOption[];
  order_index: number;
}

export interface QuizOption {
  text: string;
  is_correct: boolean;
}

export interface ModuleWithContent extends TrainingModule {
  content: TrainingContent[];
  quiz: QuizQuestion[];
  last_section_viewed?: number;
}

export interface ProgressSummary {
  path: 'operator' | 'technician';
  totalModules: number;
  completedModules: number;
  overallProgress: number;
  modules: TrainingModule[];
}

export interface Certificate {
  id: string;
  user_id: string;
  training_path: 'operator' | 'technician';
  certificate_number: string;
  issued_at: string;
  expires_at: string;
  is_valid: boolean;
  user_name?: string;
}
