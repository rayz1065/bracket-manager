import React from 'react';
import { LightMode, ModeNight } from '@mui/icons-material';

type PropsT = {
  nightMode: boolean;
  setNightMode: (nightMode: boolean) => void;
}

function NightModeToggle ({ nightMode, setNightMode }: PropsT) {
  function getIcon () {
    return nightMode
      ? <LightMode></LightMode>
      : <ModeNight></ModeNight>;
  }

  return (
    <button onClick={() => setNightMode(!nightMode)}>
      {getIcon()}
    </button>
  );
}

export default NightModeToggle;
