import { Handle, Position } from '@xyflow/react';
import './CustomNode.css';
import { IoMdCloseCircleOutline } from 'react-icons/io';
import React, { memo } from 'react';

interface CustomNodeProps {
  data: {
    label: string;
    courseId?: number;
    title: string;
    isClosing?: boolean;
    isStrikethrough?: boolean;
    onClose?: (id: string) => void;
    style?: React.CSSProperties;
    mark?: string;
    showMark?: boolean;
  };
  id: string;
}

const CustomNode = memo(({ data, id }: CustomNodeProps) => {
  const handleClose = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (data.onClose) {
        data.onClose(id);
      }
    },
    [data.onClose, id]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.stopPropagation();
        if (data.onClose) {
          data.onClose(id);
        }
      }
    },
    [data.onClose, id]
  );

  const getClassName = () => {
    let className = 'custom-node';
    if (data.isClosing) className += ' closing';
    if (data.isStrikethrough && !data.isClosing) className += ' strikethrough';
    return className;
  };

  return (
    <div
      className={getClassName()}
      style={data.style}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`Node: ${data.label}`}
    >
      <span>{data.label}</span>

      <button
        className="close-btn"
        onClick={handleClose}
        aria-label={
          data.isStrikethrough
            ? `Really close ${data.label}`
            : `Close ${data.label}`
        }
        title={
          data.isStrikethrough
            ? 'Click to remove strikethrough'
            : 'Click to add strikethrough'
        }
        tabIndex={-1}
      >
        <IoMdCloseCircleOutline className="text-2xl" />
      </button>

      {data.showMark && data.mark && (
        <div className="mark-container">
          <span className="mark" aria-label={`Mark: ${data.mark}`}>
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
