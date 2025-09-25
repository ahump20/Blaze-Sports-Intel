import type {
  BaseballStanding,
  BaseballGame,
  BaseballPlayerBasic,
  BaseballPlayerStatsSeason,
} from '@blaze/core';

export interface BaseballProvider {
  standings(season: number): Promise<BaseballStanding[]>;
  schedule(dateISO: string): Promise<BaseballGame[]>;
  team(id: number): Promise<{
    team: {
      id: number;
      name: string;
      abbr: string;
      league: 'AL' | 'NL';
      division: 'E' | 'C' | 'W';
    };
    roster: BaseballPlayerBasic[];
  }>;
  player(id: number, season?: number): Promise<{
    profile: BaseballPlayerBasic;
    seasons: BaseballPlayerStatsSeason[];
  }>;
}
