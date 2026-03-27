import { useOutletContext } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  const { handleAddressConfirm } = useOutletContext<any>();
  return <HeroSection onAddressConfirm={handleAddressConfirm} />;
}
