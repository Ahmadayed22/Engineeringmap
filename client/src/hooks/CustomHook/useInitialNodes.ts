import { useState } from 'react';
import { Node } from '@xyflow/react';
import { initialNodes } from '@components/layout/node/initialNodes';

export function useInitialNodes() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, setNodes] = useState<Node[]>(() =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialNodes.map((node: any) => ({
      ...node,
      data: {
        ...node.data,
        onClose: (id: string) => {
          console.log('Closing node with courseId:', id);
          setNodes((nds) =>
            nds.map((n) =>
              n.data.courseId === id
                ? { ...n, data: { ...n.data, isClosing: true } }
                : n
            )
          );
          setTimeout(() => {
            setNodes((nds) => nds.filter((n) => n.data.courseId !== id));
          }, 400);
        },
      },
    }))
  );

  //   return { nodes, setNodes };
}
