// types.ts
export type User = {
    id: number;
    username: string;
    email: string;
    profile_picture: string | null;
    time_wallet: string;
    bio:string;
    skills_offered:string[];
    is_admin: boolean;
    date_joined: string;
    completed_sessions:number
  };
  
  export type LeaderboardEntry = {
    id: number;
    user_id: number;
    week: number;
    score: string;
    timestamp: string;
  };
  
  export type TimePeriod = 'all-time' | 'month';
  
  export type LeaderboardProps = {
    entries: LeaderboardEntry[];
    users: User[];
    currentUserId?: number;
  };