export interface BasketballProvider {
  standings(season: number): Promise<unknown>;
  schedule(dateISO: string): Promise<unknown>;
}
