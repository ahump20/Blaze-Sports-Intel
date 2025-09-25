export interface FootballProvider {
  standings(season: number): Promise<unknown>;
  schedule(week: number, season: number): Promise<unknown>;
}
