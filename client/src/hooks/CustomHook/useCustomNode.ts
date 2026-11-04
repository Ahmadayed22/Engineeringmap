import CustomNodeProps from '@customTypes/CustomeNode';
import { useCallback } from 'react';
import { useI18n } from '@i18n/context';

const useCustomNode = ({ data, id }: CustomNodeProps) => {
  const { t } = useI18n();
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
    const name = String(data.label).trim();
    if (data.status === 'available') return t('node.available', { name });
    if (data.status === 'locked' && data.missingNames)
      return t('node.locked', { name, names: data.missingNames });
    return t('node.course', { name });
  }, [data.label, data.status, data.missingNames, t]);

  const getStatusTitle = useCallback(() => {
    if (data.status === 'available') return t('node.titleAvailable');
    if (data.status === 'locked' && data.missingNames)
      return t('node.titleNeeds', { names: data.missingNames });
    return undefined;
  }, [data.status, data.missingNames, t]);

  const getCloseButtonAriaLabel = useCallback(
    () => t('node.toggleDone', { name: String(data.label).trim() }),
    [data.label, t]
  );

  const getCloseButtonTitle = useCallback(() => t('node.toggleTitle'), [t]);

  const getMarkAriaLabel = useCallback(
    () => (data.mark ? t('node.grade', { g: data.mark }) : ''),
    [data.mark, t]
  );

  return {
    handleClose,
    handleKeyDown,
    getClassName,
    getAriaLabel,
    getStatusTitle,
    getCloseButtonAriaLabel,
    getCloseButtonTitle,
    getMarkAriaLabel,
  };
};

export default useCustomNode;
