import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import ARDesignerPage from "./pages/ARDesignerPage";
import PredictionPage from "./pages/PredictionPage";
import CalculatorPage from "./pages/CalculatorPage";
import DigitalTwinPage from "./pages/DigitalTwinPage";
import HeatmapPage from "./pages/HeatmapPage";
import LiveSimPage from "./pages/LiveSimPage";
import CarbonCreditsPage from "./pages/CarbonCreditsPage";
import WeatherImpactPage from "./pages/WeatherImpactPage";
import ReportPage from "./pages/ReportPage";
import AIChatPage from "./pages/AIChatPage";
import Login from "./pages/Login";
import Shop from "./pages/Shop";
import Orders from "./pages/Orders";
import SellerDashboard from "./pages/SellerDashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="ar-designer" element={<ARDesignerPage />} />
              <Route path="prediction" element={<PredictionPage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="digital-twin" element={<DigitalTwinPage />} />
              <Route path="heatmap" element={<HeatmapPage />} />
              <Route path="live-sim" element={<LiveSimPage />} />
              <Route path="ai-chat" element={<AIChatPage />} />
              <Route path="carbon" element={<CarbonCreditsPage />} />
              <Route path="weather" element={<WeatherImpactPage />} />
              <Route path="report" element={<ReportPage />} />
              
              {/* Customer Routes */}
              <Route path="shop" element={<Shop />} />
              <Route path="orders" element={<Orders />} />
              
              {/* Seller Routes */}
              <Route path="seller-dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
