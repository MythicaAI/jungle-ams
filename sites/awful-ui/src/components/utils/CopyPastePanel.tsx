import React from 'react';
import { Button } from '@mui/joy';
import { Panel, XYPosition } from '@xyflow/react';

type Props = {
  cut: () => void;
  paste: ({ x, y }: XYPosition) => void;
  copy: () => void;
  canCopy: boolean;
  canPaste: boolean;
};

export const CopyPastePanel: React.FC<Props> = ({
  cut,
  paste,
  copy,
  canCopy,
  canPaste,
}) => {
  return (
    <Panel position="top-left">
      <Button
        onClick={() => cut()}
        disabled={!canCopy}
        color="danger"
        sx={{ mr: '6px', py: '5px', minHeight: 'auto' }}
      >
        Cut
      </Button>
      <Button
        onClick={() => copy()}
        disabled={!canCopy}
        color="primary"
        sx={{ mr: '6px', py: '4px', minHeight: 'auto' }}
      >
        Copy
      </Button>
      <Button
        onClick={() => paste({ x: 0, y: 0 })}
        disabled={!canPaste}
        color="neutral"
        sx={{ py: '4px', minHeight: 'auto' }}
      >
        Paste
      </Button>
    </Panel>
  );
};
