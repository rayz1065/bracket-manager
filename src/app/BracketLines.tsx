import React from 'react';
import { MatchT } from './models/match.model';

type PropsT = {
  match: MatchT;
}

function BracketLines ({ match }: PropsT) {
  const { players, winnerIdx, loserRecovered } = match;
  const disputed = winnerIdx !== null;

  const forwardLinesEl = players.map((player, playerIdx) => {
    const won = playerIdx === winnerIdx;
    const lost = disputed && playerIdx !== winnerIdx;
    return (
      <div key={playerIdx}
        className={`h-1/4 border-r-2 bracket-line
        ${won ? 'won' : ''}
        ${lost ? 'lost' : ''}
        ${loserRecovered ? 'recovered' : ''}
        ${playerIdx === 0 ? 'border-t-2' : 'border-b-2'}`}
      ></div>
    );
  });

  return (
    <div className='flex'>
      {/* 2 forward lines from players */}
      <div>
        <div className='h-1/4'></div>
        {forwardLinesEl}
      </div>
      {/* connecting line */}
      <div>
        <div className={`h-1/2 border-b-2 bracket-line
          ${disputed ? 'won' : ''}`}
        ></div>
      </div>
    </div>
  );
}

export default BracketLines;
