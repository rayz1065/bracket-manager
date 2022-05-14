import React, { MouseEventHandler } from 'react';
import { PlayerT } from './models/player.model';

type propsType = {
  player: PlayerT | null;
  lost: boolean;
  won: boolean;
  handleClick?: MouseEventHandler;
}

function Player ({ player, lost, won, handleClick }: propsType) {
  const disabled = !handleClick;

  return (
    <button className={`player border-2
      flex justify-center items-center
      ${won ? 'won' : ''}
      ${lost ? 'lost' : ''}`}
      onClick={handleClick}
      disabled={disabled}>
      {player}
    </button>
  );
}

export default Player;
