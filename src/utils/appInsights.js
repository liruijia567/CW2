import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: 'e294cccd-ea9b-43d1-8bb8-3b5351ffcf2d',
    enableAutoRouteTracking: true,
  },
});

appInsights.loadAppInsights();

export default appInsights;