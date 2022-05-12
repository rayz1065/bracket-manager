import React, { useState } from 'react';
import BracketCompactToggle from './BracketCompactToggle';
import { BracketT } from './models/bracket.model';
import Player from './Player';
import Round from './Round';
import { checkAllPrevPlayed, getBracketWinner } from './utils';

type PropsT = {
  bracket: BracketT;
  setWinner: (roundIdx: number, idx: number, winnerIdx: number) => void
}

function Bracket ({ bracket, setWinner }: PropsT) {
  const [compact, setCompact] = useState(false);
  const winner = getBracketWinner(bracket);

  const roundsEl = bracket.map((round, roundIdx) => {
    return (
      <Round key={roundIdx} round={round}
        checkAllPrevPlayed={(matchIdx) => checkAllPrevPlayed(bracket, roundIdx, matchIdx)}
        setWinner={(idx, winnerIdx) => setWinner(roundIdx, idx, winnerIdx)}
      ></Round>
    );
  });
  return (
    <div className='overflow-x-auto'>
      <BracketCompactToggle compact={compact}
        setCompact={setCompact}
      ></BracketCompactToggle>
      <div className={`flex bracket
        ${compact ? 'compact' : ''}`}>
        {roundsEl}
        <div className='flex flex-col'>
          <Player player={winner}></Player>
        </div>
      </div>
    </div>
  );
}

export default Bracket;
