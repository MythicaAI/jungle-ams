import React, { useEffect, useMemo } from 'react';
import { useViewport } from '@xyflow/react';

type methodType = () => { width: number, height: number, top: number, left: number, right: number, bottom: number }
type USDViewerType = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> 
                          & { 
                            src: string; 
                            alt?: string, 
                            subs?: boolean,
                            oldMethod?: methodType;
                            getBoundingClientRect?: methodType;
                          }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    
    interface IntrinsicElements {
      'usd-viewer': USDViewerType
    }
  }
}

interface USDViewerProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
}

const USDViewer: React.FC<USDViewerProps> = ({ src, alt, style }) => {
  const viewerRef = React.useRef<HTMLElement>(null);
  const viewport = useViewport();
  const oldrefs: Record<string,methodType | boolean> = useMemo(() => ({}), []);
  useEffect(() => {
    if (viewerRef.current) {
      
      oldrefs.oldMethod = viewerRef.current.getBoundingClientRect as methodType;
      const curBox = oldrefs.oldMethod(); 
      if (!oldrefs.subs) {
        curBox.width = curBox.width / viewport.zoom;
        curBox.height = curBox.height / viewport.zoom;
      }
      viewerRef.current.getBoundingClientRect = function() {
        return new DOMRect(
          0,
          0, 
          curBox.width, 
          curBox.height);
      };
      oldrefs.subs = true
    }

  }, [oldrefs, viewport.zoom]);

  return (
    <div style={style}>
      <usd-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
      ></usd-viewer>
    </div>
  );
};

export default USDViewer;
