export const TICKET_STATUS = {
  WILL_START: 'will_start',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
};

export const STATUS_LABELS = {
  [TICKET_STATUS.WILL_START]: 'Will Start',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.COMPLETED]: 'Completed',
  [TICKET_STATUS.BLOCKED]: 'Blocked',
};

export const STATUS_COLORS = {
  [TICKET_STATUS.WILL_START]: '#6B7280',
  [TICKET_STATUS.IN_PROGRESS]: '#3B82F6',
  [TICKET_STATUS.COMPLETED]: '#10B981',
  [TICKET_STATUS.BLOCKED]: '#EF4444',
};

export const USER_ROLES = {
  DEVELOPER: 'developer',
  TEAM_LEAD: 'team_lead',
};

export const ROLE_LABELS = {
  [USER_ROLES.DEVELOPER]: 'Developer',
  [USER_ROLES.TEAM_LEAD]: 'Team Lead',
};

export const PLATFORMS = {
  ANDROID: 'android',
  IOS: 'ios',
  FLUTTER: 'flutter',
};

export const PLATFORM_LABELS = {
  [PLATFORMS.ANDROID]: 'Android',
  [PLATFORMS.IOS]: 'iOS',
  [PLATFORMS.FLUTTER]: 'Flutter',
};

export const DEV_LEVELS = {
  INTERN: 'intern',
  JUNIOR: 'junior',
  MID: 'mid',
  SENIOR_I: 'senior_i',
  SENIOR_II: 'senior_ii',
};

export const DEV_LEVEL_LABELS = {
  [DEV_LEVELS.INTERN]: 'Intern',
  [DEV_LEVELS.JUNIOR]: 'Junior',
  [DEV_LEVELS.MID]: 'Mid-Level',
  [DEV_LEVELS.SENIOR_I]: 'Senior I',
  [DEV_LEVELS.SENIOR_II]: 'Senior II',
};

export const DAY_NAMES = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};
