import React, { useCallback, useEffect, useState } from 'react';
import { Edge, Node, useReactFlow } from '@xyflow/react';
import { UndoRedoContext } from '../hooks/useUndoRedo';

type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
};

const MAX_HISTORY_SIZE = 100;
const ENABLE_SHORTCUTS = true;

export type UndoRedoOptions = {
  maxHistorySize: number;
  enableShortcuts: boolean;
};

const UndoRedoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // the past and future arrays store the states that we can jump to
  const [past, setPast] = useState<HistoryItem[]>([]);
  const [future, setFuture] = useState<HistoryItem[]>([]);

  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const takeSnapshot = useCallback(() => {
    // push the current graph to the past state
    setPast((past) => [
      ...past.slice(past.length - MAX_HISTORY_SIZE + 1, past.length),
      { nodes: getNodes(), edges: getEdges() },
    ]);

    // whenever we take a new snapshot, the redo operations need to be cleared to avoid state mismatches
    setFuture([]);
  }, [getNodes, getEdges, MAX_HISTORY_SIZE]);

  const undo = useCallback(() => {
    // get the last state that we want to go back to
    const pastState = past[past.length - 1];

    if (pastState) {
      // first we remove the state from the history
      setPast((past) => past.slice(0, past.length - 1));
      // we store the current graph for the redo operation
      setFuture((future) => [
        ...future,
        { nodes: getNodes(), edges: getEdges() },
      ]);
      // now we can set the graph to the past state
      setNodes(pastState.nodes);
      setEdges(pastState.edges);
    }
  }, [setNodes, setEdges, getNodes, getEdges, past]);

  const redo = useCallback(() => {
    const futureState = future[future.length - 1];

    if (futureState) {
      setFuture((future) => future.slice(0, future.length - 1));
      setPast((past) => [...past, { nodes: getNodes(), edges: getEdges() }]);
      setNodes(futureState.nodes);
      setEdges(futureState.edges);
    }
  }, [setNodes, setEdges, getNodes, getEdges, future]);

  useEffect(() => {
    // this effect is used to attach the global event handlers
    if (!ENABLE_SHORTCUTS) {
      return;
    }

    const keyDownHandler = (event: KeyboardEvent) => {
      if (
        event.key === 'z' &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey
      ) {
        redo();
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        undo();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [undo, redo, ENABLE_SHORTCUTS]);

  return (
    <UndoRedoContext.Provider
      value={{
        undo,
        redo,
        takeSnapshot,
        canUndo: !!past.length,
        canRedo: !!future.length,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
};

export default UndoRedoProvider;
