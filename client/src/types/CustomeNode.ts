type CustomNodeProps = {
  data: {
    label: string;
    courseId?: number;
    title: string;
    isClosing?: boolean;
    isStrikethrough?: boolean;
    onClose?: (id: string) => void;
    style?: React.CSSProperties;
    mark?: string;
    /** Set only for signed-in users with highlighting on. */
    status?: 'completed' | 'available' | 'locked';
    /** Names of missing prerequisites, for locked courses. */
    missingNames?: string;
  };
  id: string;
};
export default CustomNodeProps;
