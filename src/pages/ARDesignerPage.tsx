import { useOutletContext } from 'react-router-dom';
import ARDesigner from '@/components/ARDesigner';

export default function ARDesignerPage() {
  const { address, coordinates, handleCommitLayout } = useOutletContext<any>();
  return <ARDesigner address={address} coordinates={coordinates} onCommit={handleCommitLayout} />;
}
