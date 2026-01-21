
export interface ExperienceEntry {
  title: string;
  company: string;
  dates: string;
  description: string;
}

export interface ProfileData {
  header: {
    name: string;
    headline: string;
  };
  about: string;
  experience: ExperienceEntry[];
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
