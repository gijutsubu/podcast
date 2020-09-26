export const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;

export const existsGaId = googleAnalyticsId !== "";

export const pageview = (path: string) => {
  window.gtag("config", googleAnalyticsId ?? '', {
    page_path: path,
  });
};
