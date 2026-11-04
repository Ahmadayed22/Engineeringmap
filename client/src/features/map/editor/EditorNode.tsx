import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

/**
 * A course box in the map editor. Same size and text as on the live map (the colour comes
 * from the node's style, like there), without the progress controls.
 */
const EditorNode = memo(({ data, selected }: NodeProps) => (
  <div
    className={`flex min-w-[225px] items-center justify-center rounded-[12px] p-[14px] text-center text-[19px] font-bold text-white ${
      selected ? 'outline outline-4 outline-offset-2 outline-sky-300' : ''
    }`}
  >
    <Handle type="target" position={Position.Top} />
    <span className="whitespace-normal">{String(data.label ?? '')}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-white" />
  </div>
));

EditorNode.displayName = 'EditorNode';

export default EditorNode;
