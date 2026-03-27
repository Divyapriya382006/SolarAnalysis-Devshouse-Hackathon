import { useOutletContext } from 'react-router-dom';
import EnergyPrediction from '@/components/EnergyPrediction';

export default function PredictionPage() {
  const { systemData } = useOutletContext<any>();
  return <EnergyPrediction systemData={systemData} />;
}
