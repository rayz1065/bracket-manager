import React, { useState } from 'react';
import Bracket from './Bracket';
import { BracketT } from './models/bracket.model';
import { PlayerT } from './models/player.model';
import NightModeToggle from './NightModeToggle';
import PlayerAdder from './PlayerAdder';
import { calculateMainVictory, calculateVictory, generateBrackets, getDefaultPlayers } from './utils';

function App () {
  const [players, setPlayers] = useState(() => getDefaultPlayers());
  const [brackets, setBrackets] = useState(() => generateBrackets(players));
  const [nightMode, setNightMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  function setWinnerMain (roundIdx: number, idx: number, winnerIdx: number) {
    const newBrackets = calculateMainVictory(brackets, roundIdx, idx, winnerIdx);
    setBrackets(newBrackets);
  }

  function setWinnerRecovery (bracketIdx: number, roundIdx: number, idx: number, winnerIdx: number) {
    const newBracket = calculateVictory(brackets.recovery![bracketIdx], roundIdx, idx, winnerIdx);
    const recovery: [BracketT, BracketT] = [...brackets.recovery!];
    const main = brackets.main;
    recovery[bracketIdx] = newBracket;
    setBrackets({ recovery, main });
  }

  function addPlayer (player: PlayerT) {
    const newPlayers = [...players, player];
    setPlayers(newPlayers);
    setBrackets(generateBrackets(newPlayers));
  }

  function getRecovery (bracketIdx: number) {
    if (brackets.recovery === null) {
      return <div>No recovery bracket {bracketIdx}</div>;
    }
    return (
      <>
        <h1 className='text-lg font-semibold mt-3'>
          Recovery {bracketIdx + 1}
        </h1>
        <Bracket bracket={brackets.recovery[bracketIdx]}
          setWinner={(roundIdx, idx, winnerIdx) => setWinnerRecovery(bracketIdx, roundIdx, idx, winnerIdx)}
        ></Bracket>
      </>
    );
  }

  return (
    <div className={`${nightMode ? 'dark' : ''}`}>
      <div className='w-full min-h-screen px-3 md:px-6 dark:bg-neutral-900 dark:text-neutral-300'>
        <h1 className='text-2xl font-bold dark:text-neutral-100'>
          Bracket management
          <span className='ml-2'>
            <NightModeToggle nightMode={nightMode}
              setNightMode={setNightMode}
            ></NightModeToggle>
          </span>
        </h1>
        <PlayerAdder
          players={players}
          addPlayer={addPlayer}
        ></PlayerAdder>
        <h1 className='text-lg font-semibold mt-3'>
          Main bracket
        </h1>
        <Bracket bracket={brackets.main}
          setWinner={setWinnerMain}
        ></Bracket>

        {getRecovery(0)}
        {getRecovery(1)}
      </div>
    </div>
  );
}

export default App;
