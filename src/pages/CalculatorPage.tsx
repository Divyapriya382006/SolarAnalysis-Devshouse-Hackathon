import { useOutletContext } from 'react-router-dom';
import CostCalculator from '@/components/CostCalculator';

export default function CalculatorPage() {
  const { systemData } = useOutletContext<any>();
  return <CostCalculator systemData={systemData} />;
}
