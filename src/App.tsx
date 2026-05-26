import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DomainRouter from "./components/DomainRouter";
import IntlLanding from "./pages/IntlLanding";
import NotFound from "./pages/NotFound";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import CheckoutSuccess from "./pages/checkout/CheckoutSuccess";
import CheckoutCancel from "./pages/checkout/CheckoutCancel";
import CheckoutRedirect from "./pages/checkout/CheckoutRedirect";
import SalesLogin from "./pages/sales/SalesLogin";
import SalesDashboard from "./pages/sales/SalesDashboard";
import LandingES1 from "./pages/landing/LandingES1";
import LandingES2 from "./pages/landing/LandingES2";
import LandingENUS1 from "./pages/landing/LandingENUS1";
import AnalysisCarta from "./pages/landing/AnalysisCarta";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DomainRouter />} />
          <Route path="/intl" element={<IntlLanding />} />
          <Route path="/p/:code" element={<CheckoutRedirect />} />
          <Route path="/checkout/:planSlug" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/sales/login" element={<SalesLogin />} />
          <Route path="/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/portalcomercial" element={<SalesLogin />} />
          <Route path="/comercialportal" element={<SalesLogin />} />
          <Route path="/analisis-carta" element={<AnalysisCarta />} />
          {/* SEO Landing pages — Sprint 1 */}
          <Route path="/es/carta-de-vinos-digital-para-restaurante" element={<LandingES1 />} />
          <Route path="/es/software-gestion-bodega-restaurante" element={<LandingES2 />} />
          <Route path="/en-us/wine-menu-management-software-restaurant" element={<LandingENUS1 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
