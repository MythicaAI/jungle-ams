import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import { GetFileResponse } from '../../types/MythicaApi';

type FileEdgeProps = EdgeProps & {
    data: {
        files: GetFileResponse[];
    };
};

export function FileEdge(edge: FileEdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX: edge.sourceX,
        sourceY: edge.sourceY,
        sourcePosition: edge.sourcePosition,
        targetX: edge.targetX,
        targetY: edge.targetY,
        targetPosition: edge.targetPosition,
      });
  return (
    <>
      <BaseEdge id={edge.id} path={edgePath} />
    </>
  );
}