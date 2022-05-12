import { BracketT } from './models/bracket.model';
import { MatchT } from './models/match.model';
import { calculateVictory, checkAllPrevPlayed, generateMainBracket, getBracketWinner, getMatchesCount, getNextMatchIdx, getPrevMatchIdx, getRoundsCount } from './utils';

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
  expect(newBracket[0][0]!.loserRecovered).toBe(false);

  newBracket = calculateVictory(newBracket, 0, 1, 0); // 'B' wins
  newBracket = calculateVictory(newBracket, 1, 0, 0); // 'I' wins
  expect(newBracket[2][0]!.players).toEqual(['I', null]);

  expect(newBracket[0][0]!.loserRecovered).toBe(true); // 'A' recovered
  expect(newBracket[0][1]!.loserRecovered).toBe(false); // 'J' not recovered
  expect(newBracket[1][0]!.loserRecovered).toBe(true); // 'I' recovered
});

test('leaves bracket unchanged on invalid match selection', () => {
  const bracket = generateMainBracket(['A', 'B', 'C', 'D', 'E']);
  expect(calculateVictory(bracket, 1, 0, 0)).toEqual(bracket); // no match
  expect(calculateVictory(bracket, 0, 1, 1)).toEqual(bracket); // empty player

  const newBracket = calculateVictory(bracket, 0, 0, 0);
  expect(calculateVictory(newBracket, 0, 0, 1)).toEqual(newBracket); // repeating match
  expect(checkAllPrevPlayed(bracket, 1, 0)).toBe(false);
  expect(calculateVictory(newBracket, 1, 0, 0)).toEqual(newBracket); // prev not played
});

test('identifies the bracket winner', () => {
  const bracket = generateMainBracket(['A', 'B']);
  const newBracket = calculateVictory(bracket, 0, 0, 0);

  expect(getBracketWinner(bracket)).toBeNull();
  expect(getBracketWinner(newBracket)).toBe('A');
});
