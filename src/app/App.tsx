import React, { useState } from 'react';
import Bracket from './Bracket';
import { PlayerT } from './models/player.model';
import NightModeToggle from './NightModeToggle';
import PlayerAdder from './PlayerAdder';
import { calculateVictory, generateMainBracket, getDefaultPlayers } from './utils';

function App () {
  const [players, setPlayers] = useState(() => getDefaultPlayers());
  const [bracket, setBracket] = useState(() => generateMainBracket(players));
  const [nightMode, setNightMode] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);

  function setWinner (roundIdx: number, idx: number, winnerIdx: number) {
    const newBracket = calculateVictory(bracket, roundIdx, idx, winnerIdx);
    setBracket(newBracket);
  }

  function addPlayer (player: PlayerT) {
    const newPlayers = [...players, player];
    setPlayers(newPlayers);
    setBracket(generateMainBracket(newPlayers));
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
        <Bracket bracket={bracket}
          setWinner={setWinner}
        ></Bracket>
      </div>
    </div>
  );
}

export default App;
