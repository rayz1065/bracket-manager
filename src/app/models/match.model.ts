import { PlayerT } from './player.model';

export interface MatchT {
  players: (PlayerT | null)[];
  winnerIdx: number | null;
  loserRecovered: boolean;
}
