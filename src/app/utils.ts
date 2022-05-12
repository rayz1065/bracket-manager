// functions for players

import { BracketT } from './models/bracket.model';
import { MatchT } from './models/match.model';
import { PlayerT } from './models/player.model';

export function getDefaultPlayers (): PlayerT[] {
  return [
    // 'Mario rossi',
    // 'Mirco bianchi',
    // 'Andrea verdi',
    // 'Stefano grigi',
    // 'Marco neri',
    // 'Giuseppe rossi',
    // 'Massimo gialli',
    // 'Matteo blu'
  ];
}

// math functions

export function getRoundsCount (playersCount: number): number {
  return Math.ceil(Math.log2(playersCount));
}

export function getMatchesCount (roundIdx: number, roundsCount: number): number {
  return Math.pow(2, roundsCount - roundIdx - 1);
}

export function getNextMatchIdx (idx: number): number {
  return Math.floor(idx / 2);
}

export function getPrevMatchIdx (idx: number, playerIdx: number): number {
  return idx * 2 + playerIdx;
}

// bracket functions

/**
 * generates a bracket from the players with at least 1 round
 */
export function generateMainBracket (players: PlayerT[]): BracketT {
  const roundsCount = getRoundsCount(Math.max(players.length, 2));
  const bracket: BracketT = [];
  // create the required rounds, each with the required matches
  for (let roundIdx = 0; roundIdx < roundsCount; roundIdx++) {
    const matchesCount = getMatchesCount(roundIdx, roundsCount);
    const round = [];
    for (let matchIdx = 0; matchIdx < matchesCount; matchIdx++) {
      round.push(null);
    }
    bracket.push(round);
  }
  // populate the first round
  const r0MatchesCount = getMatchesCount(0, roundsCount);
  for (let matchIdx = 0; matchIdx < r0MatchesCount; matchIdx++) {
    bracket[0][matchIdx] = {
      players: [
        players[matchIdx] ?? null,
        players[matchIdx + r0MatchesCount] ?? null
      ],
      winnerIdx: null,
      loserRecovered: false
    };
  }

  return bracket;
}

/**
 * checks that all the previous matches have been played
 */
export function checkAllPrevPlayed (bracket: BracketT, roundIdx: number, idx: number): boolean {
  const ff: [number, number][] = [[roundIdx, idx]];
  const begRoundIdx = roundIdx;
  let curr;
  // visit matches, depth first
  while ((curr = ff.pop())) {
    const [roundIdx, idx] = curr;
    const match = bracket[roundIdx][idx];
    // other than the first round, previous must be played
    if (roundIdx !== begRoundIdx && (!match || match.winnerIdx === null)) {
      return false;
    }
    if (roundIdx > 0) {
      // push the previous matches
      ff.push(
        [roundIdx - 1, getPrevMatchIdx(idx, 0)],
        [roundIdx - 1, getPrevMatchIdx(idx, 1)]
      );
    }
  }
  return true;
}

/**
 * propagates the loser recovered status to previous matches
 */
function propagateLoserRecovered (bracket: BracketT, roundIdx: number, idx: number): BracketT {
  const newBracket = [...bracket];
  while (roundIdx >= 0) {
    const match = bracket[roundIdx][idx]!;
    newBracket[roundIdx] = [...newBracket[roundIdx]];
    newBracket[roundIdx][idx] = {
      ...match,
      loserRecovered: true
    };
    roundIdx -= 1;
    idx = getPrevMatchIdx(idx, match.winnerIdx!);
  }
  return newBracket;
}

/**
 * calculates a victory and returns a new bracket
 */
export function calculateVictory (bracket: BracketT, roundIdx: number, idx: number, winnerIdx: number): BracketT {
  const match = bracket[roundIdx][idx];
  if (!match || match.winnerIdx !== null || !checkAllPrevPlayed(bracket, roundIdx, idx)) {
    // unset match or match with already set winner
    return bracket;
  }
  const winner = match.players[winnerIdx];
  if (winner === null) {
    // empty player was selected
    return bracket;
  }
  let newBracket = [...bracket];

  // if the player reached the quarter finals, recover the losers
  let loserRecovered = false;
  if (bracket.length - roundIdx === 3) {
    // quarter finals
    loserRecovered = true;
  }

  // update the current match
  newBracket[roundIdx] = [...newBracket[roundIdx]];
  newBracket[roundIdx][idx] = {
    ...match,
    winnerIdx
  };

  // update the next match
  if (roundIdx + 1 < newBracket.length) {
    const nextMatchIdx = getNextMatchIdx(idx);
    const nextMatch: MatchT = newBracket[roundIdx + 1][nextMatchIdx] ?? {
      players: [null, null],
      winnerIdx: null,
      loserRecovered: false
    };
    const newPlayers = [...nextMatch.players];
    newPlayers[idx % 2] = winner;
    newBracket[roundIdx + 1] = [...newBracket[roundIdx + 1]];
    newBracket[roundIdx + 1][nextMatchIdx] = {
      ...nextMatch,
      players: newPlayers
    };
  }

  if (loserRecovered) {
    // propagate the loser recovered status
    newBracket = propagateLoserRecovered(newBracket, roundIdx, idx);
  }
  return newBracket;
}

/**
 * returns the overall winner from the final match
 */
export function getBracketWinner (bracket: BracketT): PlayerT | null {
  const finalMatch = bracket[bracket.length - 1][0];
  const winner = finalMatch !== null && finalMatch.winnerIdx !== null
    ? finalMatch.players[finalMatch.winnerIdx]
    : null;
  return winner;
}
