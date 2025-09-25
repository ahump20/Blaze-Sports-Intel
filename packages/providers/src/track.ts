export interface TrackProvider {
  meets(dateISO: string): Promise<unknown>;
  athletes(query: string): Promise<unknown>;
}
