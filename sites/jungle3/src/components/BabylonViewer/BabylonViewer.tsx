import React from 'react';
import "@babylonjs/viewer"

interface HTML3DElementAttributes
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  source?: string;
  environment?: string;
}

declare global {    // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'babylon-viewer': HTML3DElementAttributes;
    }
  }
}

interface BabylonViewerProps {
  src: string;
  environment?: string;
  style?: React.CSSProperties;
}

const STUDIO_ENVIRONMENT = 'https://unpkg.com/@babylonjs/viewer@preview/assets/photoStudio.env';
const BabylonViewer: React.FC<BabylonViewerProps> = ({ src, environment, style }) => {


  return (
    <div style={style}>
      <babylon-viewer source={src} environment={environment ? environment : STUDIO_ENVIRONMENT}></babylon-viewer>
    </div>
  );
};

export default BabylonViewer;
