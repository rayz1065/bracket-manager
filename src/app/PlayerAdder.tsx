import React, { ChangeEvent, FormEvent, useState } from 'react';
import { PlayerT } from './models/player.model';

type PropsT = {
  players: PlayerT[],
  addPlayer: (player: PlayerT) => void
}

function PlayerAdder ({ players, addPlayer }: PropsT) {
  const [value, setValue] = useState('');
  const valid = value.length > 0;

  function handleInputChange (event: ChangeEvent<HTMLInputElement>): void {
    const target = event.target;
    setValue(target.value);
  }

  function onSubmit (event: FormEvent): void {
    event.preventDefault();
    if (!valid) {
      return;
    }
    addPlayer(value);
    setValue('');
  }

  return (
    <form onSubmit={onSubmit}>
      <h2 className='text-lg font-semibold'>
        Add a new player
      </h2>
      <input value={value} className='border-l border-t border-b rounded-l-lg p-2'
        onChange={handleInputChange} placeholder='New player name...'></input>
      <button type='submit' className={`border rounded-r-lg p-2
        ${valid ? 'border-sky-500 hover:bg-sky-500 hover:text-white' : 'text-gray-500'}`}
        disabled={!valid}>
        Add player
      </button>
      <p>
        Players count: <b>{players.length}</b>
      </p>
    </form>
  );
}

export default PlayerAdder;
