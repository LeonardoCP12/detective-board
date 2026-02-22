import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath, getSmoothStepPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  type,
  className
}) => {
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;
  
  const params = {
      sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition
  };

  // Calcular la ruta según el tipo de hilo
  if (type === 'straight') {
      [edgePath, labelX, labelY] = getStraightPath(params);
  } else if (type === 'step') {
      [edgePath, labelX, labelY] = getSmoothStepPath({ ...params, borderRadius: 0 });
  } else if (type === 'smoothstep') {
      [edgePath, labelX, labelY] = getSmoothStepPath(params);
  } else {
      // Por defecto (Bezier)
      [edgePath, labelX, labelY] = getBezierPath(params);
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} className={className} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="custom-edge-label">
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const CustomEdgeStraight = (props) => <CustomEdge {...props} type="straight" />;
export const CustomEdgeStep = (props) => <CustomEdge {...props} type="step" />;
export const CustomEdgeSmoothStep = (props) => <CustomEdge {...props} type="smoothstep" />;
export const CustomEdgeDefault = (props) => <CustomEdge {...props} type="default" />;

export default CustomEdge;
