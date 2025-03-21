import React from 'react';
import './styles.css'; // Import the CSS file

type Props = {
  checked: boolean;
};

export const RadioIndicator: React.FC<Props> = ({ checked }) => {
  return (
    <div className={`radio-button ${checked ? 'checked' : ''}`}>
      {checked && <div className="radio-button-dot" />}
    </div>
  );
};
