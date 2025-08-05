// components/ProgressNode.tsx
// import './../../layout/node/NodeStyle.css';
type ProgressNodeProps = {
  data: {
    label: string;
    // add other properties if needed
  };
};

export default function ProgressNode({ data }: ProgressNodeProps) {
  return <div className="root-node">{data.label}</div>;
}
