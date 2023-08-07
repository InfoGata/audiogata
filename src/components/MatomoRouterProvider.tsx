import { createInstance, MatomoProvider } from "@datapunt/matomo-tracker-react";
import { MatomoProviderProps } from "@datapunt/matomo-tracker-react/lib/MatomoProvider";
import React from "react";
import { useLocation } from "react-router-dom";

interface MatomoProviderWithChildrenProps extends MatomoProviderProps {
  children: React.ReactNode;
}

const createClient = () => {
  return createInstance({
    urlBase: "https://matomo.infogata.com",
    siteId: 3,
    linkTracking: true,
    configurations: {
      disableCookies: true,
      enableJSErrorTracking: true,
    },
  });
};

const MatomoRouterProvider: React.FC<React.PropsWithChildren> = (props) => {
  let location = useLocation();
  const matomoClient = createClient();
  const MatomoProviderWithChildren: React.FC<MatomoProviderWithChildrenProps> =
    MatomoProvider;

  React.useEffect(() => {
    // track page view on each location change
    matomoClient.trackPageView();
  }, [location, matomoClient]);

  return (
    <MatomoProviderWithChildren value={matomoClient}>
      {props.children}
    </MatomoProviderWithChildren>
  );
};

export default MatomoRouterProvider;
