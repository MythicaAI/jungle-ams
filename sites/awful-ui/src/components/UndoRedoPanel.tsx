import React from 'react';
import { Divider, Stack } from '@mui/joy';
import { Panel } from '@xyflow/react';
import { LucideRedo2, LucideUndo2 } from 'lucide-react';

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

export const UndoRedoPanel: React.FC<Props> = ({
  canRedo,
  canUndo,
  undo,
  redo,
}) => {
  return (
    <Panel position="bottom-center">
      <Stack
        direction="row"
        sx={{ borderRadius: '16px', background: '#24292e' }}
        gap="8px"
        padding="6px 12px"
      >
        <Stack
          direction="row"
          onClick={canUndo ? undo : undefined}
          gap="4px"
          sx={{
            alignItems: 'center',
            cursor: canUndo ? 'pointer' : 'not-allowed',
            opacity: canUndo ? 1 : 0.5,
            ':hover': { opacity: canUndo ? 0.75 : 0.5 },
          }}
        >
          <LucideUndo2 size={16} />
          Undo
        </Stack>
        <Divider orientation="vertical" />
        <Stack
          direction="row"
          gap="4px"
          sx={{
            alignItems: 'center',
            cursor: canRedo ? 'pointer' : 'not-allowed',
            opacity: canRedo ? 1 : 0.5,
            ':hover': { opacity: canRedo ? 0.75 : 0.5 },
          }}
          onClick={canRedo ? redo : undefined}
        >
          Redo
          <LucideRedo2 size={16} />
        </Stack>
      </Stack>
    </Panel>
  );
};
