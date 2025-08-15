import CustomNodeProps from '@customTypes/CustomeNode';
import { useCallback } from 'react';

const useCustomNode = ({ data, id }: CustomNodeProps) => {
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (data.onClose) {
        data.onClose(id);
      }
    },
    [data.onClose, id]
  );

  const handleKeyDown = useCallback(
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

  const getClassName = useCallback(() => {
    let className = 'custom-node';
    if (data.isClosing) className += ' closing';
    if (data.isStrikethrough && !data.isClosing) className += ' strikethrough';
    return className;
  }, [data.isClosing, data.isStrikethrough]);

  const getAriaLabel = useCallback(() => {
    return `Node: ${data.label}`;
  }, [data.label]);

  const getCloseButtonAriaLabel = useCallback(() => {
    return data.isStrikethrough
      ? `Really close ${data.label}`
      : `Close ${data.label}`;
  }, [data.isStrikethrough, data.label]);

  const getCloseButtonTitle = useCallback(() => {
    return data.isStrikethrough
      ? 'Click to remove strikethrough'
      : 'Click to add strikethrough';
  }, [data.isStrikethrough]);

  const getMarkAriaLabel = useCallback(() => {
    return data.mark ? `Mark: ${data.mark}` : '';
  }, [data.mark]);

  return {
    handleClose,
    handleKeyDown,
    getClassName,
    getAriaLabel,
    getCloseButtonAriaLabel,
    getCloseButtonTitle,
    getMarkAriaLabel,
  };
};

export default useCustomNode;
