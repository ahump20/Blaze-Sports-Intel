export type Sport = 'baseball' | 'football' | 'basketball' | 'track';
export const SPORT_ORDER: Sport[] = ['baseball', 'football', 'basketball', 'track'];

export interface ApiError {
  status: number;
  code:
    | 'NOT_CONFIGURED'
    | 'UPSTREAM_ERROR'
    | 'RATE_LIMITED'
    | 'BAD_REQUEST'
    | 'INTERNAL_ERROR'
    | 'NOT_FOUND';
  message: string;
  details?: unknown;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  total?: number;
  nextPage?: number | null;
}

export interface BaseballTeam {
  id: number;
  name: string;
  abbr: string;
  league: 'AL' | 'NL';
  division: 'E' | 'C' | 'W';
  wins: number;
  losses: number;
  pct: number;
  gb?: string;
}

export interface BaseballStanding {
  league: 'AL' | 'NL';
  division: 'E' | 'C' | 'W';
  teams: BaseballTeam[];
  season: number;
  asOf: string;
}

export interface BaseballGame {
  gamePk: number;
  date: string;
  status: string;
  homeTeamId: number;
  awayTeamId: number;
  homeScore?: number;
  awayScore?: number;
}

export interface BaseballPlayerBasic {
  id: number;
  firstName: string;
  lastName: string;
  primaryNumber?: string;
  primaryPosition?: string;
  currentTeamId?: number;
}

export interface BaseballPlayerStatsSeason {
  season: number;
  batting?: {
    gamesPlayed: number;
    atBats: number;
    runs: number;
    hits: number;
    doubles: number;
    triples: number;
    homeRuns: number;
    rbi: number;
    baseOnBalls: number;
    strikeOuts: number;
    stolenBases: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
  };
  pitching?: {
    gamesPlayed: number;
    gamesStarted: number;
    wins: number;
    losses: number;
    saves: number;
    inningsPitched: number;
    era: number;
    whip: number;
    strikeOuts: number;
    baseOnBalls: number;
    hits: number;
    homeRuns: number;
  };
}
