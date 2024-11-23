import { useEffect } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';

const JSONViewer = ({ fileUrl, style }: { fileUrl: string, style: React.CSSProperties }) => {
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.createModel(
        `Loading...`, // Placeholder content initially
        'json', // Language mode
        monaco.Uri.parse(fileUrl) // URI for the remote file
      );

      // Fetch the file and update the model directly
      fetch(fileUrl)
        .then((response) => response.json())
        .then((data) => {
          const model = monaco.editor.getModel(monaco.Uri.parse(fileUrl));
          if (model) {
            model.setValue(JSON.stringify(data, null, 2)); // Pretty-print JSON
          }
        })
        .catch((error) => console.error('Error fetching JSON:', error));
    });
  }, [fileUrl]);

  return (
    <div style={{ ...style }}>
      <MonacoEditor
        language="json"
        theme="vs-dark"
        height={style.height}
        width={style.width}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        path={fileUrl} // Bind the Monaco model to this path
      />
    </div>
  );
};

export default JSONViewer;
