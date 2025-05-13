'use client';

import { useState } from 'react';

export const AttackButton = () => {
  const [showFrame, setShowFrame] = useState(false);

  const toggleFrame = () => {
    setShowFrame(!showFrame);
  };

  return (
    <div>
      <button onClick={toggleFrame} className="btn-primary">Attack</button>
      {showFrame && (
        <div className="frame">
          {[...Array(16)].map((_, index) => (
            <div key={index} className="listbox">
              <label htmlFor={`attack-${index}`}>Attack {index + 1}</label>
              <select id={`attack-${index}`} className="select">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};