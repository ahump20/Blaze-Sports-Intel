import {
  badRequest,
  internalError,
  upstreamError,
  notFound,
  BaseballStanding,
  BaseballGame,
  BaseballPlayerBasic,
  BaseballPlayerStatsSeason,
} from '@blaze/core';
import { json, error } from '../lib/http.js';
import { cachedFetch } from '../lib/cache.js';
import { enforceRateLimit } from '../lib/rateLimit.js';
import { resolveCacheTtl, resolveRateLimit } from '../util/config.js';
import type { Env } from '../index.js';

const MLB_BASE = 'https://statsapi.mlb.com/api/v1';

interface MLBLeagueRecord {
  league?: { nameCode?: 'AL' | 'NL' };
  division?: { abbreviation?: 'E' | 'C' | 'W' };
  teamRecords?: MLBTeamRecord[];
}

interface MLBTeamRecord {
  team?: {
    id?: number;
    name?: string;
    abbreviation?: string;
  };
  wins?: number;
  losses?: number;
  winningPercentage?: string;
  gamesBack?: string;
}

interface MLBStandingsResponse {
  records?: MLBLeagueRecord[];
}

interface MLBScheduleResponse {
  dates?: Array<{
    games?: MLBScheduleGame[];
  }>;
}

interface MLBScheduleGame {
  gamePk?: number;
  gameDate?: string;
  status?: { detailedState?: string };
  teams?: {
    home?: { team?: { id?: number }; score?: number };
    away?: { team?: { id?: number }; score?: number };
  };
}

interface MLBTeamsResponse {
  teams?: MLBTeam[];
}

interface MLBTeam {
  id?: number;
  name?: string;
  abbreviation?: string;
  league?: { nameCode?: 'AL' | 'NL' };
  division?: { abbreviation?: 'E' | 'C' | 'W' };
}

interface MLBTeamDetailsResponse {
  teams?: MLBTeam[];
}

interface MLBRosterResponse {
  roster?: Array<{
    person?: { id?: number; fullName?: string };
    jerseyNumber?: string;
    position?: { abbreviation?: string };
  }>;
}

interface MLBPlayerResponse {
  people?: MLBPerson[];
}

interface MLBPerson {
  id?: number;
  firstName?: string;
  lastName?: string;
  primaryNumber?: string;
  primaryPosition?: { abbreviation?: string };
  currentTeam?: { id?: number };
  stats?: MLBStatGroup[];
}

interface MLBStatGroup {
  group?: { displayName?: string };
  splits?: MLBStatSplit[];
}

interface MLBStatSplit {
  season?: string;
  stat?: MLBStatLine;
}

interface MLBStatLine {
  gamesPlayed?: number | string;
  gamesStarted?: number | string;
  wins?: number | string;
  losses?: number | string;
  saves?: number | string;
  inningsPitched?: number | string;
  era?: number | string;
  whip?: number | string;
  strikeOuts?: number | string;
  baseOnBalls?: number | string;
  hits?: number | string;
  homeRuns?: number | string;
  atBats?: number | string;
  runs?: number | string;
  doubles?: number | string;
  triples?: number | string;
  rbi?: number | string;
  stolenBases?: number | string;
  avg?: number | string;
  obp?: number | string;
  slg?: number | string;
  ops?: number | string;
}

const ensureNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const readNumber = (value: number | string | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

async function mlbRequest<T>(env: Env, path: string): Promise<T> {
  const ttl = resolveCacheTtl(env);
  const request = new Request(`${MLB_BASE}${path}`);
  const response = await cachedFetch(request, ttl);
  if (!response.ok) {
    throw new Error(`MLB upstream ${response.status}`);
  }
  return (await response.json()) as T;
}

const normalizeStandings = (data: MLBStandingsResponse, season: number): BaseballStanding[] => {
  if (!data.records) {
    return [];
  }

  return data.records
    .filter((record): record is MLBLeagueRecord => Boolean(record))
    .map((record) => {
      const league = record.league?.nameCode ?? 'AL';
      const division = record.division?.abbreviation ?? 'E';
      const teams: BaseballStanding['teams'] =
        record.teamRecords?.map((teamRecord) => ({
          id: teamRecord.team?.id ?? 0,
          name: teamRecord.team?.name ?? 'Unknown',
          abbr: teamRecord.team?.abbreviation ?? 'UNK',
          league,
          division,
          wins: teamRecord.wins ?? 0,
          losses: teamRecord.losses ?? 0,
          pct: Number.parseFloat(teamRecord.winningPercentage ?? '0') || 0,
          gb: teamRecord.gamesBack ?? undefined,
        })) ?? [];

      return {
        league,
        division,
        teams,
        season,
        asOf: new Date().toISOString(),
      };
    });
};

const normalizeSchedule = (data: MLBScheduleResponse): BaseballGame[] => {
  if (!data.dates) {
    return [];
  }

  const games: BaseballGame[] = [];
  for (const date of data.dates) {
    for (const game of date.games ?? []) {
      games.push({
        gamePk: game.gamePk ?? 0,
        date: game.gameDate ?? '',
        status: game.status?.detailedState ?? 'Unknown',
        homeTeamId: game.teams?.home?.team?.id ?? 0,
        awayTeamId: game.teams?.away?.team?.id ?? 0,
        homeScore: ensureNumber(game.teams?.home?.score),
        awayScore: ensureNumber(game.teams?.away?.score),
      });
    }
  }

  return games;
};

const normalizeTeam = (teamData: MLBTeamDetailsResponse, rosterData: MLBRosterResponse) => {
  const team = teamData.teams?.[0];
  const roster = rosterData.roster ?? [];
  const normalizedRoster: BaseballPlayerBasic[] = roster.map((member) => {
    const fullName = member.person?.fullName ?? '';
    const [firstName, ...rest] = fullName.split(' ');
    return {
      id: member.person?.id ?? 0,
      firstName,
      lastName: rest.join(' '),
      primaryNumber: member.jerseyNumber,
      primaryPosition: member.position?.abbreviation,
      currentTeamId: team?.id,
    };
  });

  return {
    team: {
      id: team?.id ?? 0,
      name: team?.name ?? 'Unknown',
      abbr: team?.abbreviation ?? 'UNK',
      league: team?.league?.nameCode ?? 'AL',
      division: team?.division?.abbreviation ?? 'E',
    },
    roster: normalizedRoster,
  };
};

const normalizePlayer = (data: MLBPlayerResponse, seasonFilter?: number) => {
  const person = data.people?.[0];
  if (!person) {
    throw new Error('Player not found');
  }

  const profile: BaseballPlayerBasic = {
    id: person.id ?? 0,
    firstName: person.firstName ?? '',
    lastName: person.lastName ?? '',
    primaryNumber: person.primaryNumber,
    primaryPosition: person.primaryPosition?.abbreviation,
    currentTeamId: person.currentTeam?.id,
  };

  const seasons: BaseballPlayerStatsSeason[] = [];
  for (const group of person.stats ?? []) {
    for (const split of group.splits ?? []) {
      const season = split.season ? Number.parseInt(split.season, 10) : undefined;
      if (seasonFilter && season !== seasonFilter) {
        continue;
      }
      const stat = split.stat;
      if (!stat) {
        continue;
      }
      if (group.group?.displayName === 'hitting') {
        seasons.push({
          season: season ?? 0,
          batting: {
            gamesPlayed: readNumber(stat.gamesPlayed),
            atBats: readNumber(stat.atBats),
            runs: readNumber(stat.runs),
            hits: readNumber(stat.hits),
            doubles: readNumber(stat.doubles),
            triples: readNumber(stat.triples),
            homeRuns: readNumber(stat.homeRuns),
            rbi: readNumber(stat.rbi),
            baseOnBalls: readNumber(stat.baseOnBalls),
            strikeOuts: readNumber(stat.strikeOuts),
            stolenBases: readNumber(stat.stolenBases),
            avg: readNumber(stat.avg),
            obp: readNumber(stat.obp),
            slg: readNumber(stat.slg),
            ops: readNumber(stat.ops),
          },
        });
      } else if (group.group?.displayName === 'pitching') {
        seasons.push({
          season: season ?? 0,
          pitching: {
            gamesPlayed: readNumber(stat.gamesPlayed),
            gamesStarted: readNumber(stat.gamesStarted),
            wins: readNumber(stat.wins),
            losses: readNumber(stat.losses),
            saves: readNumber(stat.saves),
            inningsPitched: readNumber(stat.inningsPitched),
            era: readNumber(stat.era),
            whip: readNumber(stat.whip),
            strikeOuts: readNumber(stat.strikeOuts),
            baseOnBalls: readNumber(stat.baseOnBalls),
            hits: readNumber(stat.hits),
            homeRuns: readNumber(stat.homeRuns),
          },
        });
      }
    }
  }

  return { profile, seasons };
};

const clientError = (message: string) => error(badRequest(message));

export async function handleMLB(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
  const limit = resolveRateLimit(env);
  const ip = req.headers.get('cf-connecting-ip') ?? 'anonymous';
  const limited = await enforceRateLimit(env, `mlb:${ip}`, limit);
  if (limited) {
    return limited;
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/v1/baseball', '');

    if (path === '/standings') {
      const season = Number.parseInt(url.searchParams.get('season') ?? String(new Date().getFullYear()), 10);
      const data = await mlbRequest<MLBStandingsResponse>(env, `/standings?leagueId=103,104&season=${season}`);
      const payload = normalizeStandings(data, season);
      return json(payload);
    }

    if (path === '/schedule') {
      const date = url.searchParams.get('date');
      if (!date) {
        return clientError('date is required (YYYY-MM-DD)');
      }
      const data = await mlbRequest<MLBScheduleResponse>(env, `/schedule?sportId=1&date=${encodeURIComponent(date)}`);
      return json(normalizeSchedule(data));
    }

    if (path === '/teams') {
      const data = await mlbRequest<MLBTeamsResponse>(env, '/teams?sportId=1&activeStatus=Yes');
      const teams = (data.teams ?? []).map((team) => ({
        id: team.id ?? 0,
        name: team.name ?? 'Unknown',
        abbr: team.abbreviation ?? 'UNK',
        league: team.league?.nameCode ?? 'AL',
        division: team.division?.abbreviation ?? 'E',
      }));
      return json(teams);
    }

    if (path.startsWith('/team/')) {
      const teamId = path.split('/')[2];
      const numericTeamId = Number.parseInt(teamId, 10);
      if (Number.isNaN(numericTeamId)) {
        return clientError('teamId must be numeric');
      }
      const [teamData, rosterData] = await Promise.all([
        mlbRequest<MLBTeamDetailsResponse>(env, `/teams/${numericTeamId}`),
        mlbRequest<MLBRosterResponse>(env, `/teams/${numericTeamId}/roster`),
      ]);
      return json(normalizeTeam(teamData, rosterData));
    }

    if (path.startsWith('/player/')) {
      const playerId = path.split('/')[2];
      const numericPlayerId = Number.parseInt(playerId, 10);
      if (Number.isNaN(numericPlayerId)) {
        return clientError('playerId must be numeric');
      }
      const seasonParam = url.searchParams.get('season');
      const hydrate = `stats(group=[hitting,pitching,fielding],type=[season,career,gameLog]${seasonParam ? `,season=${seasonParam}` : ''})`;
      const data = await mlbRequest<MLBPlayerResponse>(env, `/people/${numericPlayerId}?hydrate=${encodeURIComponent(hydrate)}`);
      const payload = normalizePlayer(data, seasonParam ? Number.parseInt(seasonParam, 10) : undefined);
      return json(payload);
    }

    return error(notFound('Unknown MLB route'));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('Player not found')) {
      return error(notFound(message));
    }
    if (message.startsWith('MLB upstream')) {
      return error(upstreamError(502, message));
    }
    return error(internalError(message));
  }
}
