/* UPDATED TYPES */
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string | null;
  profile_picture?: string | null; // URI
  user_skills: number[]; // unique integers
  availability?: string | null;
}

export interface Skill {
  id: number;
  user: number;
  name: string;
  description: string;
  is_offered: boolean;
  location: "local" | "remote";
  address?: string | null;
  tags: string[];
  is_visible?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;
  booked_by: string;
  booked_for: string;
  skill: Skill;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  scheduled_time: string;
  duration: number;
  created_at: string;
  cancel_reason: string | null;
}

export interface Notification {
  id: number;
  type: "booking_request" | "booking_status" | "message" | "review";
  content: string;
  is_read: boolean;
  created_at: string;
  user: number;
}


/* OLD TYPES */

// export type Skill = {
//   id: number;
//   name: string;
//   description: string | null;
//   user: User | null;
//   is_offered: boolean;
//   created_at: string;
//   updated_at: string;
//   tags: string[];
//   location: "local" | "remote";
// };

// export type Session = {
//   id: number;
//   scheduled_time: string;
//   duration: number;
//   status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
//   created_at: string;
//   skill: Skill;
//   requester: User;
//   provider: User;
// };

export type WalletTransaction = {
  id: number;
  amount: number;
  reason: string;
  timestamp: string;
};

export type LeaderboardEntry = {
  total_hours_given: number;
  total_hours_received: number;
  sessions_completed: number;
  net_contribution: string;
  user: User;
};

export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  // Add other group properties as needed (e.g., image, tags, etc.)
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: User;
  timestamp: string;
  // Add other announcement properties
}

export const initialMockMessages: ChatMessage[] = [
  {
    id: 1,
    senderId: 4,
    senderName: "Alice Johnson",
    senderAvatar: "https://placehold.co/100x100/ff7f7f/ffffff?text=AJ",
    text: "Welcome to the community chat!",
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 2,
    senderId: 2,
    senderName: "Bob Williams",
    senderAvatar: "https://placehold.co/100x100/7fb2ff/ffffff?text=BW",
    text: "Hey everyone!",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 3,
    senderId: 3,
    senderName: "Diana Miller",
    senderAvatar: "https://placehold.co/100x100/7fffb2/ffffff?text=DM",
    text: "Looking for someone to help with graphic design!",
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
];

// Mock data based on the database schema
export const mockUser: User = {
  id: 1,
  email: "john.doe@example.com",
  username: "johndoe",
  first_name: "John",
  last_name: "Doe",
  bio: "Computer Science student passionate about web development and machine learning.",
  profile_picture: "/placeholder.svg?height=200&width=200",
  user_skills: [],
};

// Existing Users
const saraAhmed: User = {
  id: 2,
  email: "sara@example.com",
  username: "saradev",
  first_name: "Sara",
  last_name: "Ahmed",
  bio: "Frontend developer specializing in React",
  profile_picture: null,
  user_skills: [],
};

const michaelJohnson: User = {
  id: 3,
  email: "michael@example.com",
  username: "michaelj",
  first_name: "Michael",
  last_name: "Johnson",
  bio: "Beginner programmer looking to improve",
  profile_picture: null,
  user_skills: [],
};

const alexChen: User = {
  id: 4,
  email: "alex@example.com",
  username: "alextech",
  first_name: "Alex",
  last_name: "Chen",
  bio: "Teaching programming for 3 years",
  profile_picture: null,
  user_skills: [],
};

// New Users
const emilyDavis: User = {
  id: 5,
  email: "emily.davis@example.com",
  username: "emilyd",
  first_name: "Emily",
  last_name: "Davis",
  bio: "Graphic designer with a passion for illustration.",
  profile_picture: null,
  user_skills: [],
};

const davidWilson: User = {
  id: 6,
  email: "david.w@example.com",
  username: "davidw",
  first_name: "David",
  last_name: "Wilson",
  bio: "Musician and music theory tutor.",
  profile_picture: null,
  user_skills: [],
};

const oliviaMartinez: User = {
  id: 7,
  email: "olivia.m@example.com",
  username: "oliviam",
  first_name: "Olivia",
  last_name: "Martinez",
  bio: "Yoga instructor and mindfulness coach.",
  profile_picture: null,
  user_skills: [],
};
export const allUsers = [
  mockUser,
  saraAhmed,
  michaelJohnson,
  alexChen,
  emilyDavis,
  davidWilson,
  oliviaMartinez,
];

export const mockSkills: Skill[] = [
  {
    id: 1,
    name: "JavaScript Programming",
    user: 0,
    description:
      "Modern JavaScript including ES6+ features, async/await, and frameworks",
    is_offered: false,
    created_at: "2024-09-20T14:30:00Z",
    updated_at: "2024-09-20T14:30:00Z",
    tags: ["Tech", "Programming", "Web"],
    location: "local",
  },
  {
    id: 2,
    name: "Python Data Analysis",
    user: 2,
    description: "Data analysis using pandas, numpy, and matplotlib",
    is_offered: true,
    created_at: "2024-10-05T09:15:00Z",
    updated_at: "2024-10-05T09:15:00Z",
    tags: ["Data", "Science", "Python"],
    location: "local",
  },
  {
    id: 3,
    name: "UI/UX Design",
    description: "Learn UI/UX Design",
    user: 1,
    is_offered: false,
    created_at: "2024-10-10T16:45:00Z",
    updated_at: "2024-10-10T16:45:00Z",
    tags: ["Design", "Creative", "Business"],
    location: "local",
  },
  {
    id: 4,
    name: "React Development",
    description: "Building web applications with React",
    user: 4,
    is_offered: true,
    created_at: "2024-10-15T11:30:00Z",
    updated_at: "2024-10-15T11:30:00Z",
    tags: ["Tech", "Programming", "Web"],
    location: "remote",
  },
  {
    id: 5,
    name: "Illustration Basics",
    description: "Introduction to digital illustration techniques.",
    user: 3,
    is_offered: true,
    created_at: "2024-01-25T10:00:00Z",
    updated_at: "2024-01-25T10:00:00Z",
    tags: ["Design", "Creative", "Business"],
    location: "remote",
  },
  {
    id: 6,
    name: "Beginner Piano Lessons",
    description: "Learn the fundamentals of playing the piano.",
    user: 3,
    is_offered: true,
    created_at: "2024-02-15T14:00:00Z",
    updated_at: "2024-02-15T14:00:00Z",
    tags: ["Music", "Arts", "Learning"],
    location: "remote",
  },
  {
    id: 7,
    name: "Mindfulness Meditation",
    description: "Guided meditation sessions for stress reduction.",
    user: 0,
    is_offered: true, // Assuming Olivia offers this
    created_at: "2024-03-05T09:00:00Z",
    updated_at: "2024-03-05T09:00:00Z",
    tags: ["Fitness", "Wellness", "Health"],
    location: "remote",
  },
];

export const mockSessions: Booking[] = [
  {
    id: 1,
    scheduled_time: "2024-11-25T15:00:00Z",
    duration: 60,
    status: "confirmed",
    created_at: "2024-11-20T10:30:00Z",
    cancel_reason: null,
    booked_by: "",
    booked_for: "",
    skill: mockSkills[0],
  },
  {
    id: 2,
    scheduled_time: "2024-11-28T14:00:00Z",
    duration: 90,
    status: "pending",
    created_at: "2024-11-22T09:15:00Z",
    cancel_reason: null,
    booked_by: "",
    booked_for: "",
    skill: mockSkills[1],
  },
  {
    id: 3,
    scheduled_time: "2024-04-10T11:00:00Z",
    duration: 45,
    status: "completed",
    created_at: "2024-04-05T15:00:00Z",
    cancel_reason: null,
    booked_by: "",
    booked_for: "",
    skill: mockSkills[2],
  },
];

export const mockTransactions: WalletTransaction[] = [
  {
    id: 1,
    amount: 2.5, // Positive amount means earned
    reason: "Session Completed: JavaScript Programming",
    timestamp: "2025-11-15T16:30:00Z",
  },
  {
    id: 2,
    amount: -1.5, // Negative amount means spent
    reason: "Session Completed: UI/UX Design Basics",
    timestamp: "2025-01-10T14:45:00Z",
  },
  {
    id: 3,
    amount: 1.0,
    reason: "Reward: First Session Completed",
    timestamp: "2025-02-25T11:20:00Z",
  },
  {
    // New Transaction 1 (from new booking 3)
    id: 4,
    amount: -0.75, // Spent 45 mins / 60 mins/hour = 0.75 hours
    reason: "Session Completed: Illustration Basics",
    timestamp: "2025-03-10T12:00:00Z", // After the session time
  },
  {
    // New Transaction 2 (from new booking 3)
    id: 5,
    amount: 0.75, // Earned 45 mins / 60 mins/hour = 0.75 hours
    reason: "Session Completed: Illustration Basics",
    timestamp: "2025-04-10T12:00:00Z", // After the session time
  },
  {
    // New Transaction 3 (from new booking 4)
    id: 6,
    amount: -1.0, // Spent 60 mins / 60 mins/hour = 1 hour
    reason: "Session Completed: Beginner Piano Lessons",
    timestamp: "2025-04-12T17:00:00Z", // After the session time
  },
  {
    // New Transaction 4 (from new booking 4)
    id: 7,
    amount: 1.0, // Earned 60 mins / 60 mins/hour = 1 hour
    reason: "Session Completed: Beginner Piano Lessons",
    timestamp: "2025-04-22T17:00:00Z", // After the session time
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    total_hours_given: 0,
    total_hours_received: 0,
    sessions_completed: 0,
    net_contribution: "",
    user: {
      id: 1,
      email: "john.doe@example.com",
      username: "alextech",
      first_name: "Alex",
      last_name: "Chen",
      bio: "Teaching programming for 3 years",
      profile_picture: null,
      user_skills: [],
    },
  },
  {
    total_hours_given: 0,
    total_hours_received: 0,
    sessions_completed: 0,
    net_contribution: "",
    user: {
      id: 2,
      email: "alex@example.com",
      username: "alextech",
      first_name: "Alex",
      last_name: "Chen",
      bio: "Teaching programming for 3 years",
      profile_picture: null,
      user_skills: [],
    },
  },
  {
    total_hours_given: 0,
    total_hours_received: 0,
    sessions_completed: 0,
    net_contribution: "",
    user: {
      id: 3,
      email: "jane.doe@example.com",
      username: "alextech",
      first_name: "Alex",
      last_name: "Chen",
      bio: "Teaching programming for 3 years",
      profile_picture: null,
      user_skills: [],
    },
  },
  {
    total_hours_given: 0,
    total_hours_received: 0,
    sessions_completed: 0,
    net_contribution: "",
    user: {
      id: 4,
      email: "tjay@example.com",
      username: "alextech",
      first_name: "Alex",
      last_name: "Chen",
      bio: "Teaching programming for 3 years",
      profile_picture: null,
      user_skills: [],
    },
  },
];

export const mockGroups: Group[] = [
  {
    id: "grp-1",
    name: "React Developers Community",
    description:
      "A community for React enthusiasts to share knowledge and collaborate.",
    memberCount: 1500,
  },
  {
    id: "grp-2",
    name: "Tailwind CSS Users",
    description:
      "Discuss and get help with building beautiful designs using Tailwind CSS.",
    memberCount: 2100,
  },
  {
    id: "grp-3",
    name: "TypeScript Enthusiasts",
    description:
      "Deep dive into the world of TypeScript and its advanced features.",
    memberCount: 950,
  },
  {
    id: "grp-4",
    name: "Web Development Beginners",
    description:
      "Learn the basics of HTML, CSS, and JavaScript. Ask questions and get started!",
    memberCount: 3000,
  },
  {
    id: "grp-5",
    name: "Open Source Contributors",
    description:
      "Find projects to contribute to and collaborate with other open source developers.",
    memberCount: 700,
  },
];
