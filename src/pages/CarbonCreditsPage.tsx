import { useOutletContext } from 'react-router-dom';
import CarbonCredits from '@/components/CarbonCredits';

export default function CarbonCreditsPage() {
  const { systemData } = useOutletContext<any>();
  return <CarbonCredits systemData={{ annualKwh: systemData?.annualKwh || 0 }} />;
}
