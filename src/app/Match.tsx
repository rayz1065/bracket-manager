import React from 'react';
import BracketLines from './BracketLines';
import { MatchT } from './models/match.model';
import Player from './Player';

type PropsT = {
  match: MatchT | null;
  setWinner: (playerIdx: number) => void;
  allPrevPlayed: boolean;
}

function Match ({ match, allPrevPlayed, setWinner }: PropsT) {
  match = match ?? {
    players: [null, null],
    winnerIdx: null,
    loserRecovered: false
  };
  const { players, winnerIdx } = match;
  const disputed = winnerIdx !== null;
  const playable = !disputed && allPrevPlayed;

  const playersEl = players.map((player, playerIdx) => {
    const clickHandler = playable && player !== null
      ? () => setWinner(playerIdx)
      : undefined;
    return (
      <div className='h-1/2 flex items-center' key={playerIdx}>
        <Player player={player} lost={disputed && winnerIdx !== playerIdx}
          won={disputed && winnerIdx === playerIdx}
          handleClick={clickHandler}
        ></Player>
      </div>
    );
  });

  return (
    <div className='flex flex-grow'>
      <div>
        {playersEl}
      </div>
      <BracketLines match={match}></BracketLines>
    </div>
  );
}

export default Match;
