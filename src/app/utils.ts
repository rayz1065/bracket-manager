// functions for players

import { BracketT } from './models/bracket.model';
import { BracketsT } from './models/brackets.model';
import { MatchT } from './models/match.model';
import { PlayerT } from './models/player.model';

export function getDefaultPlayers (): PlayerT[] {
  return [
    'Mario rossi',
    'Mirco bianchi',
    'Andrea verdi',
    'Stefano grigi',
    'Marco neri',
    'Giuseppe rossi',
    'Massimo gialli',
    'Matteo blu'
  ];
}

// math functions

const recoveryBracketIdentifiers = ['A', 'B', 'C', 'D'] as const;
type RecoveryBracketIdentifierT = 'A' | 'B' | 'C' | 'D';
interface RecoveryBracketLocation {
  recoveryBracketIdx: number;
  roundIdx: number;
  idx: number;
  playerIdx: number;
}

function isQuarterFinals (roundIdx: number, roundsCount: number): boolean {
  return roundsCount - roundIdx === 3;
}

function isSemiFinals (roundIdx: number, roundsCount: number): boolean {
  return roundsCount - roundIdx === 2;
}

function isFinals (roundIdx: number, roundsCount: number): boolean {
  return roundsCount - roundIdx === 1;
}

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

/**
 * how many rounds does each recovery bracket contain
 */
export function getRecoveryBracketRoundsCount (roundsCount: number): number {
  // init   - initial round taking from r0
  // mid    - more rounds taking from r1+
  // merge  - 1 round merging A-B, C-D
  // finals - 1 round finding 3° place
  if (roundsCount < 3) {
    throw Error('Cannot create recovery bracket with less than 3 rounds');
  }
  return roundsCount - 1;
}

/**
 * gets the recovery bracket for an identifier
 * note: opposite bracket for semi finalists
 */
export function getRecoveryBracketIdx (
  identifier: RecoveryBracketIdentifierT,
  isSemiFinals = false
): 0 | 1 {
  let usesTopBracket = ['A', 'B'].includes(identifier);
  if (isSemiFinals) {
    usesTopBracket = !usesTopBracket;
  }
  return usesTopBracket ? 0 : 1;
}

// bracket functions

/**
 * returns the recovery bracket identifier (A, B, C, D)
 * based on the round where a player is recovered
 */
export function getRecoveryBracketIdentifier (
  roundIdx: number,
  roundsCount: number,
  idx: number,
  playerIdx: number
): RecoveryBracketIdentifierT {
  if (isFinals(roundIdx, roundsCount)) {
    throw new Error('cannot get recovery bracket identifiers of finals');
  }
  const playerOrder = 2 * idx + playerIdx;
  const normalizedPlayerOrder = playerOrder / (2 * getMatchesCount(roundIdx, roundsCount));
  const identifierIdx = Math.floor(recoveryBracketIdentifiers.length * normalizedPlayerOrder);
  return recoveryBracketIdentifiers[identifierIdx];
}

/**
 * various places in the main bracket can be mapped to a location
 * in the recovery bracket
 */
export function getRecoveryBracketLocation (
  roundIdx: number,
  roundsCount: number,
  idx: number
): RecoveryBracketLocation {
  if (roundsCount < 3) {
    throw new Error('No recovery brackets required');
  }
  if (isFinals(roundIdx, roundsCount)) {
    throw new Error('Finalists cannot be recovered');
  }
  const recoveryRoundsCount = getRecoveryBracketRoundsCount(roundsCount);
  const identifier = getRecoveryBracketIdentifier(
    roundIdx, roundsCount, idx, 0
  );
  const recoveryBracketIdx = getRecoveryBracketIdx(
    identifier,
    isSemiFinals(roundIdx, roundsCount)
  );
  if (isSemiFinals(roundIdx, roundsCount)) {
    return {
      recoveryBracketIdx,
      roundIdx: recoveryRoundsCount - 1, // finals 3-5
      idx: 0, // final round
      playerIdx: 1 // second player
    };
  }
  // the index in the recovery bracket can be calculated
  // based on the target round and the branch being used
  const recoveryRoundIdx = Math.max(roundIdx - 1, 0);
  const usesSecondaryBranch = ['B', 'D'].includes(identifier);
  const recoveryIdx = usesSecondaryBranch && roundsCount !== 3
    ? Math.pow(2, recoveryRoundsCount - recoveryRoundIdx - 3)
    : 0;
  // first round initializes player with playerIdx 0
  let recoveryPlayerIdx = (roundIdx === 0) ? 0 : 1;
  if (roundsCount === 3) {
    recoveryPlayerIdx = usesSecondaryBranch ? 1 : 0;
  }
  return {
    recoveryBracketIdx,
    roundIdx: recoveryRoundIdx,
    idx: recoveryIdx,
    playerIdx: recoveryPlayerIdx
  };
}

function generateEmptyBracket (roundsCount: number): BracketT {
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
  return bracket;
}

/**
 * generates a bracket from the players with at least 1 round
 */
export function generateMainBracket (players: PlayerT[]): BracketT {
  const roundsCount = getRoundsCount(Math.max(players.length, 2));
  const bracket: BracketT = generateEmptyBracket(roundsCount);
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

export function generateBrackets (players: PlayerT[]): BracketsT {
  const main = generateMainBracket(players);
  const recoveryRoundsCount = getRecoveryBracketRoundsCount(main.length);
  return {
    main,
    recovery: [
      generateEmptyBracket(recoveryRoundsCount),
      generateEmptyBracket(recoveryRoundsCount),
    ]
  };
}

export function noPrevMatch (bracket: BracketT, roundIdx: number, idx: number): boolean {
  const ff: [number, number][] = [[roundIdx, idx]];
  const begRoundIdx = roundIdx;
  let curr;
  // visit matches, depth first
  while ((curr = ff.pop())) {
    const [roundIdx, idx] = curr;
    const match = bracket[roundIdx][idx];
    // other than the first round, previous must be null
    if (roundIdx !== begRoundIdx && match !== null) {
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
    if (!match && noPrevMatch(bracket, roundIdx, idx)) {
      continue;
    }
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
 * calculates a victory and returns a new bracket
 */
export function calculateVictory (bracket: BracketT, roundIdx: number, idx: number, winnerIdx: number): BracketT {
  const match = bracket[roundIdx][idx];
  if (!match || match.winnerIdx !== null || !checkAllPrevPlayed(bracket, roundIdx, idx)) {
    // unset match or match with already set winner
    throw new Error('Unplayable match');
  }
  const winner = match.players[winnerIdx];
  if (winner === null) {
    // empty player was selected
    throw new Error('Invalid selected player');
  }
  const newBracket = [...bracket];

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

  return newBracket;
}

export function calculateMainVictory (brackets: BracketsT, roundIdx: number, idx: number, winnerIdx: number): BracketsT {
  brackets = { ...brackets };
  brackets.main = calculateVictory(brackets.main, roundIdx, idx, winnerIdx);
  return recoverLosers(brackets, roundIdx, idx);
}

export function recoverLosers (brackets: BracketsT, roundIdx: number, idx: number): BracketsT {
  // if the player reached the quarter finals, recover the losers
  const newBrackets = { ...brackets };
  newBrackets.main = [...newBrackets.main];
  newBrackets.recovery = [
    [...newBrackets.recovery[0]],
    [...newBrackets.recovery[1]],
  ];
  const mainBracket = newBrackets.main;
  const recoveryBrackets = newBrackets.recovery;

  if (isQuarterFinals(roundIdx, mainBracket.length)) {
    // propagate the loser recovered status
    while (roundIdx >= 0) {
      const match = mainBracket[roundIdx][idx];
      if (match === null) {
        throw Error('Found unset match while propagating recovered status');
      }
      mainBracket[roundIdx] = [...mainBracket[roundIdx]];
      mainBracket[roundIdx][idx] = {
        ...match,
        loserRecovered: true
      };

      // find the location for the recovered player
      const recLoc = getRecoveryBracketLocation(roundIdx, mainBracket.length, idx);
      recoveryBrackets[recLoc.recoveryBracketIdx] = [...recoveryBrackets[recLoc.recoveryBracketIdx]];
      recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx] =
        [...recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx]];
      const nextMatch: MatchT = recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx] ?? {
        players: [null, null],
        loserRecovered: false,
        winnerIdx: null,
      };
      const newPlayers = [...nextMatch.players];
      if (newPlayers[recLoc.playerIdx] !== null) {
        throw Error('Rewriting recovery bracket player');
      }
      newPlayers[recLoc.playerIdx] = match.players[1 - match.winnerIdx!];
      recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx] = nextMatch;
      nextMatch.players = newPlayers;

      roundIdx -= 1;
      idx = getPrevMatchIdx(idx, match.winnerIdx!);
    }

    return newBrackets;
  }
  if (isSemiFinals(roundIdx, mainBracket.length)) {
    // loser is moved to the opposite losers bracket
    const match = { ...mainBracket[roundIdx][idx]! };
    mainBracket[roundIdx][idx] = {
      ...match,
      loserRecovered: true
    };

    const recLoc = getRecoveryBracketLocation(roundIdx, mainBracket.length, idx);
    recoveryBrackets[recLoc.recoveryBracketIdx] = [...recoveryBrackets[recLoc.recoveryBracketIdx]];
    recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx] =
      [...recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx]];
    const nextMatch: MatchT = recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx] ?? {
      players: [null, null],
      loserRecovered: false,
      winnerIdx: null,
    };
    const newPlayers = [...nextMatch.players];
    if (newPlayers[recLoc.playerIdx] !== null) {
      throw Error('Rewriting recovery bracket player');
    }
    newPlayers[recLoc.playerIdx] = match.players[1 - match.winnerIdx!];
    recoveryBrackets[recLoc.recoveryBracketIdx][recLoc.roundIdx][recLoc.idx] = nextMatch;
    nextMatch.players = newPlayers;
    return newBrackets;
  }
  return brackets;
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
