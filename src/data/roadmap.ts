export type RoadmapStatus = 'completed' | 'in-progress' | 'planned';

export interface RoadmapStory {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: RoadmapStatus;
  pr?: number;
  phase: number;
}

export const roadmapStories: RoadmapStory[] = [
  {
    id: 'US1',
    title: 'Public Landing Page & Invite Requests',
    description:
      'Visitors can discover Space City Eidolons and request invites to community Discord and Matrix servers.',
    priority: 'P1',
    status: 'completed',
    pr: 12,
    phase: 2,
  },
  {
    id: 'US2',
    title: 'User Authentication & Registration',
    description:
      'Community members can log in via Discord OAuth and access member-only features.',
    priority: 'P2',
    status: 'completed',
    pr: 26,
    phase: 3,
  },
  {
    id: 'US3',
    title: 'Member Profile Management',
    description:
      'Registered members can create and manage profiles with bio, Twitch URL, game tags, and granular privacy controls.',
    priority: 'P3',
    status: 'completed',
    pr: 35,
    phase: 4,
  },
  {
    id: 'US4',
    title: 'Public Calendar & Event Discovery',
    description:
      'All users can view public events on the community calendar and filter by date range or game.',
    priority: 'P3',
    status: 'completed',
    pr: 40,
    phase: 5,
  },
  {
    id: 'US5',
    title: 'Private Event Creation',
    description:
      'Members can create private calendar events to organise small group activities.',
    priority: 'P4',
    status: 'completed',
    pr: 45,
    phase: 6,
  },
  {
    id: 'US6',
    title: 'Game Page Request Workflow',
    description:
      'Members can request new game pages with duplicate detection and status tracking.',
    priority: 'P4',
    status: 'completed',
    pr: 46,
    phase: 7,
  },
  {
    id: 'USR',
    title: 'Roadmap Page',
    description:
      'A public roadmap so the community can track development progress in real time.',
    priority: 'P3',
    status: 'completed',
    phase: 9.5,
  },
  {
    id: 'US7',
    title: 'Admin User Management',
    description:
      'Admins can view and manage users, assign roles, suspend accounts, and process invite requests.',
    priority: 'P5',
    status: 'completed',
    pr: 51,
    phase: 8,
  },
  {
    id: 'US8',
    title: 'Admin Game Page & Event Management',
    description:
      'Admins can create game pages directly, approve or reject member requests, and manage public events.',
    priority: 'P5',
    status: 'planned',
    phase: 9,
  },
  {
    id: 'US9',
    title: 'Persistent Login Sessions',
    description:
      'Members remain logged in across browser restarts using secure HttpOnly refresh tokens, eliminating unnecessary re-authentication.',
    priority: 'P3',
    status: 'planned',
    phase: 10,
  },
  {
    id: 'US10',
    title: 'Silent Token Refresh',
    description:
      'Access tokens are automatically renewed in the background during active sessions so members are never unexpectedly logged out mid-use.',
    priority: 'P3',
    status: 'planned',
    phase: 11,
  },
  {
    id: 'US11',
    title: 'Admin Delegation Safeguards',
    description:
      'Admins can promote other admins with explicit audit logging, confirmation controls, and protections against accidental lockout.',
    priority: 'P4',
    status: 'planned',
    phase: 12,
  },
  {
    id: 'US12',
    title: 'Mobile Responsiveness Improvements',
    description:
      'The website provides a polished, mobile-friendly experience across core pages, navigation, forms, and admin tools on phones and tablets.',
    priority: 'P2',
    status: 'planned',
    phase: 13,
  },
];
