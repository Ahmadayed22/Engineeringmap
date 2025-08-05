import { createContext, useContext, useState } from 'react';

interface TreeFlowContextType {
  courseId: number | unknown | null;
  setCourseId: (courseId: number | unknown | null) => void;
  nodeName: string | null;
  setNodeName: (nodeName: string | null) => void;
  title: string | unknown;
  setTitle: (title: string | unknown) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const TreeFlowContext = createContext<TreeFlowContextType | undefined>(
  undefined
);

export const useTreeFlowContext = () => {
  const context = useContext(TreeFlowContext);
  if (!context) {
    throw new Error(
      'useTreeFlowContext must be used within a TreeFlowProvider'
    );
  }
  return context;
};

export const TreeFlowProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [courseId, setCourseId] = useState<number | unknown | null>(null);
  const [nodeName, setNodeName] = useState<string | null>(null);
  const [title, setTitle] = useState<string | unknown>('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <TreeFlowContext.Provider
      value={{
        courseId,
        setCourseId,
        nodeName,
        setNodeName,
        title,
        setTitle,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </TreeFlowContext.Provider>
  );
};
