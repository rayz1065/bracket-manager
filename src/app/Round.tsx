import React from 'react';
import Match from './Match';
import { RoundT } from './models/round.model';

type PropsT = {
  round: RoundT
  setWinner: (matchIdx: number, winnerIdx: number) => void,
  checkAllPrevPlayed: (matchIdx: number) => boolean
}

function Round ({ round, setWinner, checkAllPrevPlayed }: PropsT) {
  const matchEl = round.map((match, matchIdx) => {
    return (
      <Match match={match} key={matchIdx}
        allPrevPlayed={checkAllPrevPlayed(matchIdx)}
        setWinner={winnerIdx => setWinner(matchIdx, winnerIdx)}
      ></Match>
    );
  });
  return (
    <div className='flex flex-col'>
      {matchEl}
    </div>
  );
}

export default Round;
