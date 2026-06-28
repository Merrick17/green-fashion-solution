'use client';
type WorkflowNodeProps = {
  x: number;
  y: number;
  label: string;
  sublabel: string;
};
export function WorkflowNode({ x, y, label, sublabel }: WorkflowNodeProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-72"
        y="-28"
        width="144"
        height="56"
        rx="6"
        className="fill-card stroke-border"
        strokeWidth="1"
      />
      <text
        y="-4"
        textAnchor="middle"
        className="fill-foreground"
        fontSize="11"
        fontWeight="500"
        fontFamily="var(--font-geist-sans)"
      >
        {label}
      </text>
      <text
        y="14"
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize="8"
      >
        {sublabel}
      </text>
    </g>
  );
}
