import React from 'react';

interface USDViewerProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
}

const USDViewer: React.FC<USDViewerProps> = ({ src, alt, style }) => {

  return (
    <div style={style}>
      <usd-viewer
        src={src}
        alt={alt}
      ></usd-viewer>
    </div>
  );
};

export default USDViewer;
