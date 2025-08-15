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
  };
  id: string;
};
export default CustomNodeProps;
