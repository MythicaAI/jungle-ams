import React from 'react';
import { createContext, useContext } from 'react';
import useUndoRedo from '../hooks/useUndoRedo';

const UndoRedoContext = createContext<ReturnType<typeof useUndoRedo> | null>(
  null
);

export const UndoRedoProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const undoRedo = useUndoRedo();
  return (
    <UndoRedoContext.Provider value={undoRedo}>
      {children}
    </UndoRedoContext.Provider>
  );
};

export const useUndoRedoContext = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error(
      'useUndoRedoContext must be used within an UndoRedoProvider'
    );
  }
  return context;
};
