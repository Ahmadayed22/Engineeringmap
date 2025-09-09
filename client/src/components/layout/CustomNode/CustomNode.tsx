import { Handle, Position } from '@xyflow/react';
import './CustomNode.css';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import { memo } from 'react';
import CustomNodeProps from '@customTypes/CustomeNode';
import useCustomNode from '@hooks/CustomHook/useCustomNode';

const CustomNode = memo(({ data, id }: CustomNodeProps) => {
  const {
    handleClose,
    handleKeyDown,
    getClassName,
    getAriaLabel,
    getCloseButtonAriaLabel,
    getCloseButtonTitle,
    getMarkAriaLabel,
  } = useCustomNode({ data, id });

  return (
    <div
      className={getClassName()}
      style={data.style}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={getAriaLabel()}
    >
      <span className="whitespace-normal">{data.label}</span>

      <button
        className="close-btn"
        onClick={handleClose}
        aria-label={getCloseButtonAriaLabel()}
        title={getCloseButtonTitle()}
        tabIndex={-1}
      >
        <IoMdCloseCircleOutline className="text-2xl" />
      </button>

      {data.mark && (
        <div className="mark-container">
          <span className="mark" aria-label={getMarkAriaLabel()}>
            {data.mark}
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        aria-label="Source handle"
      />
      <Handle
        type="target"
        position={Position.Top}
        aria-label="Target handle"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;
