import { useEffect } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';

const CodeViewer = ({
  fileUrl,
  style,
  language,
}: {
  fileUrl: string;
  style: React.CSSProperties;
  language: string;
}) => {
  useEffect(() => {
    loader.init().then((monaco) => {
      const uri = monaco.Uri.parse(fileUrl);
      if (!monaco.editor.getModel(uri)) {
        monaco.editor.createModel(
          `Loading...`, // Placeholder content initially
          language, // Language mode
          uri // URI for the remote file
        );
      }

      // Fetch the file and update the model directly
      fetch(fileUrl)
        .then((response) => {
          if (language === 'json') {
            return response.json(); // Parse as JSON
          } else {
            return response.text(); // Fallback to text for other languages
          }
        })
        .then((data) => {
          const model = monaco.editor.getModel(monaco.Uri.parse(fileUrl));
          if (model) {
            if (language === 'json') {
              model.setValue(JSON.stringify(data, null, 2)); // Pretty-print JSON
            } else {
              model.setValue(data); // Use the raw text for other formats
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching or processing file:', error);
          const model = monaco.editor.getModel(monaco.Uri.parse(fileUrl));
          if (model) {
            model.setValue(`Error loading content: ${error.message}`); // Show error in the editor
          }
        });
    });
  }, [fileUrl, language]);

  return (
    <div style={{ ...style }}>
      <MonacoEditor
        language={language}
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

export default CodeViewer;
