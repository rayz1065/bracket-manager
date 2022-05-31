import React from 'react';

type PropsT = {
  compact: boolean;
  setCompact: (value: boolean) => void
}

function BracketCompactToggle ({ compact, setCompact }: PropsT) {
  return (
    <div>
      <label className="flex items-center w-fit">
        <input type="checkbox" className="accent-sky-500"
          checked={compact}
          onChange={() => setCompact(!compact)}></input>
        <span className="ml-2">Use compact visual</span>
      </label>
    </div>
  );
}

export default BracketCompactToggle;
