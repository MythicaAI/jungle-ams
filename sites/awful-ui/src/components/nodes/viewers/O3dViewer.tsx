import React, { useEffect, useRef } from 'react';
import * as OV from 'online-3d-viewer';


interface threeDViewerProps {
  model: string[];
  style?: React.CSSProperties;
}

const O3dViewer: React.FC<threeDViewerProps> = ({ model, style }) => {

  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewerRef.current) {
      const viewer = new OV.EmbeddedViewer(viewerRef.current, {
          camera : new OV.Camera (
            new OV.Coord3D (-1.5, 2.0, 3.0),
            new OV.Coord3D (0.0, 0.0, 0.0),
            new OV.Coord3D (0.0, 1.0, 0.0),
            45.0
        ),
        backgroundColor : new OV.RGBAColor (255, 255, 255, 255),
        defaultColor : new OV.RGBColor (200, 200, 200),
        edgeSettings : new OV.EdgeSettings (false, new OV.RGBColor (0, 0, 0), 1),

      });

      viewer.LoadModelFromUrlList(model);
    }
  }, [model]);

  return (
    <div 
      ref={viewerRef}
      className='online_3d_viewer'
      style={style}
    >
    </div>
  );
};

export default O3dViewer;