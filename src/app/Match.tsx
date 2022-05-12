import React from 'react';
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
  const { players, winnerIdx, loserRecovered } = match;
  const disputed = winnerIdx !== null;
  const playable = !disputed && allPrevPlayed;

  const playersEl = players.map((player, playerIdx) => {
    const clickHandler = playable && player !== null
      ? () => setWinner(playerIdx)
      : undefined;
    return (
      <div className='h-1/2' key={playerIdx}>
        <Player player={player} lost={disputed && winnerIdx !== playerIdx}
          handleClick={clickHandler}
        ></Player>
      </div>
    );
  });

  return (
    <div className='flex flex-row flex-grow'>
      <div>
        {playersEl}
      </div>
      {/* 2 forward lines from players */}
      <div className='bracket-line-container'>
        <div className='h-1/4'></div>
        <div className={`h-1/4 border-t-2 border-r-2 bracket-line
          ${disputed ? 'disputed' : ''}
          ${loserRecovered ? 'loser-recovered' : ''}
          ${winnerIdx === 0 ? 'winner' : ''}`}></div>
        <div className={`h-1/4 border-b-2 border-r-2 bracket-line
          ${disputed ? 'disputed' : ''}
          ${loserRecovered ? 'loser-recovered' : ''}
          ${winnerIdx === 1 ? 'winner' : ''}`}></div>
        <div className='h-1/4'></div>
      </div>
      {/* connecting line */}
      <div className='bracket-line-container'>
        <div className={`h-1/2 border-b-2 bracket-line winner
          ${disputed ? 'disputed' : ''}`}></div>
      </div>
    </div>
  );
}

export default Match;
