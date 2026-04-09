import Index from "@/pages/Index";
import IntlLanding from "@/pages/IntlLanding";

const DomainRouter = () => {
  const hostname = window.location.hostname;

  if (hostname === "checkout.winerim.wine") {
    return <IntlLanding />;
  }

  return <Index />;
};

export default DomainRouter;
