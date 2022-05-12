import React from 'react';

type PropsT = {
  compact: boolean;
  setCompact: (value: boolean) => void
}

function BracketCompactToggle ({ compact, setCompact }: PropsT) {
  return (
    <div>
      <input type='checkbox'
        className='accent-sky-500'
        id='compact-checkbox'
        checked={compact}
        onChange={(event) => setCompact(event.target.checked)}>
      </input>
      <label htmlFor='compact-checkbox' className='ml-1'>
        Use compact visual
      </label>
    </div>
  );
}

export default BracketCompactToggle;
