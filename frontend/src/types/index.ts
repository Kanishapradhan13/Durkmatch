export interface User {
  id: number;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dzongkhag: string;
  bio?: string;
  profile_photos: string[];
  interests?: string[];
  education?: string;
  occupation?: string;
  preferred_language?: 'English' | 'Dzongkha';
  zodiac_sign?: string;
  preferred_gender?: 'male' | 'female' | 'both';
  min_age?: number;
  max_age?: number;
  preferred_dzongkhags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DiscoverUser extends Omit<User, 'email'> {
  // Users in discover view don't show email
}

export interface Match {
  match_id: number;
  matched_at: string;
  matched_user_id: number;
  name: string;
  age: number;
  gender: string;
  dzongkhag: string;
  bio?: string;
  profile_photos: string[];
  interests?: string[];
  occupation?: string;
  zodiac_sign?: string;
  unread_count: number;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  message_text: string;
  sent_at: string;
  read_at?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  dzongkhag: string;
  bio?: string;
  profile_photos?: string[];
  interests?: string[];
  education?: string;
  occupation?: string;
  preferred_language?: 'English' | 'Dzongkha';
  zodiac_sign?: string;
  preferred_gender?: 'male' | 'female' | 'both';
  min_age?: number;
  max_age?: number;
  preferred_dzongkhags?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SwipeData {
  targetUserId: number;
  swipeType: 'like' | 'pass';
}

export interface SwipeResponse {
  message: string;
  swipeType: 'like' | 'pass';
  isMatch: boolean;
  matchId?: number;
}
