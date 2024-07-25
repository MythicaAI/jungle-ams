import React from 'react';

interface LitegraphViewerProps {
  url: string;
}

const LitegraphViewer: React.FC<LitegraphViewerProps> = ({ url }) => {
  const iframeUrl = `/editor/index.html?file_url=${encodeURIComponent(url)}`;

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <iframe
        src={iframeUrl}
        style={{ border: 'none', height: '100%', width: '100%' }}
        title="Litegraph Viewer"
      />
    </div>
  );
};

export default LitegraphViewer;
