import React from 'react';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'usd-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src: string; alt?: string };
    }
  }
}

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
