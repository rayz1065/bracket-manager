import React, { useState } from 'react';
import Bracket from './Bracket';
import { PlayerT } from './models/player.model';
import PlayerAdder from './PlayerAdder';
import { calculateVictory, generateMainBracket, getDefaultPlayers } from './utils';

function App () {
  const defaultPlayers = getDefaultPlayers();

  const [players, setPlayers] = useState(defaultPlayers);
  const [bracket, setBracket] = useState(generateMainBracket(players));

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
    <div className='w-screen px-3 md:px-6'>
      <h1 className='text-2xl font-bold'>
        Bracket management
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
  );
}

export default App;
