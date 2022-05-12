import React, { MouseEventHandler } from 'react';
import { PlayerT } from './models/player.model';

type propsType = {
  player: PlayerT | null;
  lost?: boolean;
  handleClick?: MouseEventHandler;
}

function Player ({ player, lost, handleClick }: propsType) {
  const disabled = !handleClick;
  return (
    <div className='h-full flex items-center'>
      <button className={`player border-2 border-black flex justify-center items-center
        ${!disabled ? 'hover:bg-sky-500 hover:border-sky-800 hover:text-white' : ''}
        ${lost ? 'text-gray-400' : ''}`}
        onClick={handleClick}
        disabled={disabled}>
        {player}
      </button>
    </div>
  );
}

export default Player;
