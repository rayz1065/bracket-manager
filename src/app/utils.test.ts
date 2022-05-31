import { BracketT } from './models/bracket.model';
import { MatchT } from './models/match.model';
import { calculateMainVictory, calculateVictory, checkAllPrevPlayed, generateBrackets, generateMainBracket, getBracketWinner, getMatchesCount, getNextMatchIdx, getPrevMatchIdx, getRecoveryBracketIdentifier, getRecoveryBracketIdx, getRecoveryBracketLocation, getRoundsCount } from './utils';

test('calculates the count of rounds', () => {
  expect(getRoundsCount(0)).toBe(-Infinity);
  expect(getRoundsCount(1)).toBe(0);
  expect(getRoundsCount(2)).toBe(1);
  expect(getRoundsCount(3)).toBe(2);
  expect(getRoundsCount(32)).toBe(5);
  expect(getRoundsCount(33)).toBe(6);
});

test('calculates the count of matches', () => {
  expect(getMatchesCount(0, 3)).toBe(4);
  expect(getMatchesCount(1, 3)).toBe(2);
  expect(getMatchesCount(2, 3)).toBe(1);

  expect(getMatchesCount(0, 5)).toBe(16);
  expect(getMatchesCount(2, 5)).toBe(4);
  expect(getMatchesCount(4, 5)).toBe(1);
});

test('calculates the next match index', () => {
  expect(getNextMatchIdx(0)).toBe(0);
  expect(getNextMatchIdx(1)).toBe(0);
  expect(getNextMatchIdx(2)).toBe(1);
  expect(getNextMatchIdx(3)).toBe(1);
  expect(getNextMatchIdx(4)).toBe(2);
});

test('calculates the previous match index', () => {
  expect(getPrevMatchIdx(0, 0)).toBe(0);
  expect(getPrevMatchIdx(0, 1)).toBe(1);
  expect(getPrevMatchIdx(1, 0)).toBe(2);
  expect(getPrevMatchIdx(1, 1)).toBe(3);
  expect(getPrevMatchIdx(2, 0)).toBe(4);
});

test('builds an empty bracket', () => {
  const bracket = generateMainBracket([]);
  expect(bracket).toHaveLength(1);
  expect(bracket[0]).toHaveLength(1);
  expect(bracket[0][0]!.players).toEqual([null, null]);
});

test('builds a bracket with 3 players', () => {
  const bracket = generateMainBracket(['A', 'B', 'C']);
  expect(bracket).toHaveLength(2);
  expect(bracket[0]).toHaveLength(2);
  expect(bracket[1]).toHaveLength(1);
  expect(bracket[0][0]!.players).toEqual(['A', 'C']);
  expect(bracket[0][1]!.players).toEqual(['B', null]);
});

test('builds a bracket with 5 players', () => {
  const bracket = generateMainBracket(['A', 'B', 'C', 'D', 'E']);
  expect(bracket).toHaveLength(3);
  expect(bracket[0]).toHaveLength(4);
  expect(bracket[1]).toHaveLength(2);
  expect(bracket[2]).toHaveLength(1);
  expect(bracket[0][0]!.players).toEqual(['A', 'E']);
  expect(bracket[0][1]!.players).toEqual(['B', null]);
  expect(bracket[0][2]!.players).toEqual(['C', null]);
  expect(bracket[0][3]!.players).toEqual(['D', null]);
});

test('checks if the previous matches have been played', () => {
  const bracket: BracketT = [
    [
      { winnerIdx: null } as MatchT,
      { winnerIdx: 1 } as MatchT,
      { winnerIdx: 0 } as MatchT,
      { winnerIdx: 1 } as MatchT,
    ],
    [
      null,
      { winnerIdx: 1 } as MatchT,
    ],
    [
      null
    ]
  ];
  expect(checkAllPrevPlayed(bracket, 2, 0)).toBe(false);
  expect(checkAllPrevPlayed(bracket, 1, 0)).toBe(false);
  expect(checkAllPrevPlayed(bracket, 1, 1)).toBe(true);
});

test('correctly calculates a victory', () => {
  const bracket = generateMainBracket(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']);
  let newBracket = calculateVictory(bracket, 0, 0, 0); // 'A' wins
  expect(newBracket[1][0]!.players).toEqual(['A', null]);

  newBracket = calculateVictory(bracket, 0, 0, 1); // 'I' wins
  expect(newBracket[1][0]!.players).toEqual(['I', null]);
  // expect(newBracket[0][0]!.loserRecovered).toBe(false);

  newBracket = calculateVictory(newBracket, 0, 1, 0); // 'B' wins
  newBracket = calculateVictory(newBracket, 1, 0, 0); // 'I' wins
  expect(newBracket[2][0]!.players).toEqual(['I', null]);

  // expect(newBracket[0][0]!.loserRecovered).toBe(true); // 'A' recovered
  // expect(newBracket[0][1]!.loserRecovered).toBe(false); // 'J' not recovered
  // expect(newBracket[1][0]!.loserRecovered).toBe(true); // 'I' recovered
});

test('throws error on invalid match selection', () => {
  const bracket = generateMainBracket(['A', 'B', 'C', 'D', 'E']);
  expect(() => calculateVictory(bracket, 1, 0, 0)).toThrowError(); // no match
  expect(() => calculateVictory(bracket, 0, 1, 1)).toThrowError(); // empty player

  const newBracket = calculateVictory(bracket, 0, 0, 0);
  expect(() => calculateVictory(newBracket, 0, 0, 1)).toThrowError(); // repeating match
  expect(checkAllPrevPlayed(bracket, 1, 0)).toBe(false);
  expect(() => calculateVictory(newBracket, 1, 0, 0)).toThrowError(); // prev not played
});

test('identifies the bracket winner', () => {
  const bracket = generateMainBracket(['A', 'B']);
  const newBracket = calculateVictory(bracket, 0, 0, 0);

  expect(getBracketWinner(bracket)).toBeNull();
  expect(getBracketWinner(newBracket)).toBe('A');
});

test('finds the correct recovery bracket identifier', () => {
  // semi finals
  expect(getRecoveryBracketIdentifier(2, 4, 0, 0)).toBe('A');
  expect(getRecoveryBracketIdentifier(2, 4, 0, 1)).toBe('B');
  expect(getRecoveryBracketIdentifier(2, 4, 1, 0)).toBe('C');
  expect(getRecoveryBracketIdentifier(2, 4, 1, 1)).toBe('D');

  // quarter finals
  expect(getRecoveryBracketIdentifier(1, 4, 0, 0)).toBe('A');
  expect(getRecoveryBracketIdentifier(1, 4, 0, 1)).toBe('A');
  expect(getRecoveryBracketIdentifier(1, 4, 1, 0)).toBe('B');
  expect(getRecoveryBracketIdentifier(1, 4, 1, 1)).toBe('B');
  expect(getRecoveryBracketIdentifier(1, 4, 2, 0)).toBe('C');
  expect(getRecoveryBracketIdentifier(1, 4, 2, 1)).toBe('C');
  expect(getRecoveryBracketIdentifier(1, 4, 3, 0)).toBe('D');
  expect(getRecoveryBracketIdentifier(1, 4, 3, 1)).toBe('D');

  // game with 64 players, 6 rounds
  expect(getRecoveryBracketIdentifier(0, 6, 0, 0)).toBe('A');
  expect(getRecoveryBracketIdentifier(0, 6, 7, 1)).toBe('A');
  expect(getRecoveryBracketIdentifier(0, 6, 8, 0)).toBe('B');
  expect(getRecoveryBracketIdentifier(0, 6, 15, 1)).toBe('B');
  expect(getRecoveryBracketIdentifier(0, 6, 16, 0)).toBe('C');
  expect(getRecoveryBracketIdentifier(0, 6, 23, 1)).toBe('C');
  expect(getRecoveryBracketIdentifier(0, 6, 24, 0)).toBe('D');
  expect(getRecoveryBracketIdentifier(0, 6, 31, 1)).toBe('D');

  expect(getRecoveryBracketIdentifier(1, 6, 0, 0)).toBe('A');
  expect(getRecoveryBracketIdentifier(1, 6, 3, 1)).toBe('A');
  expect(getRecoveryBracketIdentifier(1, 6, 4, 0)).toBe('B');
  expect(getRecoveryBracketIdentifier(1, 6, 7, 1)).toBe('B');
  expect(getRecoveryBracketIdentifier(1, 6, 8, 0)).toBe('C');
  expect(getRecoveryBracketIdentifier(1, 6, 11, 1)).toBe('C');
  expect(getRecoveryBracketIdentifier(1, 6, 12, 0)).toBe('D');
  expect(getRecoveryBracketIdentifier(1, 6, 15, 1)).toBe('D');
});

test('finds the correct recovery bracket idx', () => {
  expect(getRecoveryBracketIdx('A', false)).toBe(0);
  expect(getRecoveryBracketIdx('B', false)).toBe(0);
  expect(getRecoveryBracketIdx('C', false)).toBe(1);
  expect(getRecoveryBracketIdx('D', false)).toBe(1);

  // inverted for semi finals
  expect(getRecoveryBracketIdx('A', true)).toBe(1);
  expect(getRecoveryBracketIdx('B', true)).toBe(1);
  expect(getRecoveryBracketIdx('C', true)).toBe(0);
  expect(getRecoveryBracketIdx('D', true)).toBe(0);
});

test('finds the correct location in recovery bracket', () => {
  // semifinalists
  expect(getRecoveryBracketLocation(4, 6, 0)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 4,
    idx: 0,
    playerIdx: 1
  });
  expect(getRecoveryBracketLocation(4, 6, 1)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 4,
    idx: 0,
    playerIdx: 1
  });

  // quarter finalists
  expect(getRecoveryBracketLocation(3, 6, 0)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 2,
    idx: 0,
    playerIdx: 1
  });
  expect(getRecoveryBracketLocation(3, 6, 1)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 2,
    idx: 1,
    playerIdx: 1
  });
  expect(getRecoveryBracketLocation(3, 6, 2)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 2,
    idx: 0,
    playerIdx: 1
  });
  expect(getRecoveryBracketLocation(3, 6, 3)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 2,
    idx: 1,
    playerIdx: 1
  });

  // round 0 players
  expect(getRecoveryBracketLocation(0, 6, 0)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 0,
    idx: 0,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 6, 7)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 0,
    idx: 0,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 6, 8)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 0,
    idx: 4,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 6, 15)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 0,
    idx: 4,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 6, 16)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 0,
    idx: 0,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 6, 23)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 0,
    idx: 0,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 6, 24)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 0,
    idx: 4,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 6, 31)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 0,
    idx: 4,
    playerIdx: 0,
  });

  // 8 players
  expect(getRecoveryBracketLocation(0, 3, 0)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 0,
    idx: 0,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 3, 1)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 0,
    idx: 0,
    playerIdx: 1,
  });
  expect(getRecoveryBracketLocation(0, 3, 2)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 0,
    idx: 0,
    playerIdx: 0,
  });
  expect(getRecoveryBracketLocation(0, 3, 3)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 0,
    idx: 0,
    playerIdx: 1,
  });
  expect(getRecoveryBracketLocation(1, 3, 0)).toEqual({
    recoveryBracketIdx: 1,
    roundIdx: 1,
    idx: 0,
    playerIdx: 1,
  });
  expect(getRecoveryBracketLocation(1, 3, 1)).toEqual({
    recoveryBracketIdx: 0,
    roundIdx: 1,
    idx: 0,
    playerIdx: 1,
  });
});

test('correctly identifies and sets recovered players', () => {
  const brackets = generateBrackets(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  let newBrackets = calculateMainVictory(brackets, 0, 0, 0); // 'A' wins
  expect(newBrackets.recovery![0][0][0]).toEqual({
    players: ['E', null],
    loserRecovered: false,
    winnerIdx: null
  });
  expect(newBrackets.main[0][0]!.loserRecovered).toBeTruthy();
  newBrackets = calculateMainVictory(newBrackets, 0, 1, 0); // 'B' wins
  expect(newBrackets.recovery![0][0][0]).toEqual({
    players: ['E', 'F'],
    loserRecovered: false,
    winnerIdx: null
  });
  newBrackets = calculateMainVictory(newBrackets, 1, 0, 0); // 'A' wins
  expect(newBrackets.recovery![1][1][0]).toEqual({
    players: [null, 'B'],
    loserRecovered: false,
    winnerIdx: null
  });
});
