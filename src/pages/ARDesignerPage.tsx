import { useOutletContext } from 'react-router-dom';
import ARDesigner from '@/components/ARDesigner';

export default function ARDesignerPage() {
  const { address, handleCommitLayout } = useOutletContext<any>();
  return <ARDesigner address={address} onCommit={handleCommitLayout} />;
}
