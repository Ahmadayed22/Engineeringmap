// import { useMemo, useCallback } from 'react';

// const useOptimizedNodes = (baseNodes: Node[]) => {
//   const handleNodeClose = useCallback((nodeId: string) => {
//     // Your close logic here
//     console.log('Closing node:', nodeId);
//   }, []);

//   const optimizedNodes = useMemo(() => {
//     return baseNodes.map((node) => ({
//       ...node,
//       data: {
//         ...node.data,
//         // Use the same function reference for all nodes
//         onClose: node.type === 'custom' ? handleNodeClose : undefined,
//       },
//     }));
//   }, [baseNodes, handleNodeClose]);

//   return optimizedNodes;
// };

// export default useOptimizedNodes;
