// import { Handle, Position } from '@xyflow/react';
// import './CustomNode.css';
// import { IoMdCloseCircleOutline } from 'react-icons/io';
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export default function CustomNode({ data, id }: any) {
//   console.log('CustomNode data:', data, 'id:', id);

//   return (
//     <div
//       className={`custom-node ${data.isClosing ? 'closing' : ''}`}
//       style={data.style}
//     >
//       <span>{data.label}</span>
//       <button
//         className="close-btn"
//         onClick={(e) => {
//           e.stopPropagation();
//           if (data.onClose) {
//             data.onClose(id);
//             console.log('Node closed with if:', id);
//           } else {
//             console.log('Node closed without if :', id);
//           }
//         }}
//       >
//         <IoMdCloseCircleOutline className="text-2xl" />
//       </button>
//       <Handle type="source" position={Position.Bottom} />
//       <Handle type="target" position={Position.Top} />
//     </div>
//   );
// }

import { Handle, Position } from '@xyflow/react';
import React from 'react';
import './CustomNode.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomNode({ data, id }: any) {
  console.log('CustomNode data:', data, 'id:', id);

  return (
    <div
      className={`custom-node ${data.isClosing ? 'closing' : ''}`}
      style={data.style}
    >
      <span>{data.label}</span>
      <button
        className="close-btn"
        onClick={(e) => {
          e.stopPropagation();
          if (data.onClose) {
            data.onClose(id);
            console.log('Node closed with if:', id);
          } else {
            console.log('Node closed without if:', id);
          }
        }}
      >
        ❌
      </button>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </div>
  );
}

export default React.memo(CustomNode);
