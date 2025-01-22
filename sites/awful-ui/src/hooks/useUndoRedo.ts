import { createContext,  useContext, } from 'react';


type UndoRedoContextType = {
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  canUndo: boolean;
  canRedo: boolean;
};



export const UndoRedoContext = createContext<UndoRedoContextType | null>(
  null
);

const useUndoRedo = () => {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error(
      'useUndoRedoContext must be used within an UndoRedoProvider'
    );
  }
  return context;
};

export default useUndoRedo;
