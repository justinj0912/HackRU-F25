interface FlowConnectionProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function FlowConnection({ fromX, fromY, toX, toY }: FlowConnectionProps) {
  // Calculate control points for a curved path
  const dx = toX - fromX;
  const dy = toY - fromY;
  const midY = fromY + dy / 2;
  
  // Create an S-curve path
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
  
  return (
    <g>
      {/* Outer pipe shadow */}
      <path
        d={path}
        fill="none"
        stroke="#0a0605"
        strokeWidth="12"
        opacity="0.5"
        strokeLinecap="round"
      />
      
      {/* Main pipe body */}
      <path
        d={path}
        fill="none"
        stroke="url(#pipeGradient)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      
      {/* Pipe highlight */}
      <path
        d={path}
        fill="none"
        stroke="url(#pipeHighlight)"
        strokeWidth="3"
        opacity="0.5"
        strokeLinecap="round"
      />
      
      {/* Steam particles */}
      <circle cx={fromX + dx * 0.3} cy={fromY + dy * 0.3} r="2" fill="#9b7d5f" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={fromX + dx * 0.5} cy={fromY + dy * 0.5} r="2" fill="#9b7d5f" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={fromX + dx * 0.7} cy={fromY + dy * 0.7} r="2" fill="#9b7d5f" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="1.8s" repeatCount="indefinite" />
      </circle>
      
      {/* Arrow head */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#c17a4a"
          />
        </marker>
      </defs>
      
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="8"
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}
