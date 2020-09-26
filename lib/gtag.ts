export const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;

export const existsGaId = googleAnalyticsId !== "";

export const pageview = (path: string) => {
  window.gtag("config", googleAnalyticsId ?? '', {
    page_path: path,
  });
};

export const event = ({ action, category, label, value = "" }: { action: string, category: string, label: string, value: string }) => {
  if (!existsGaId) {
    return;
  }

  window.gtag("event", action, {
    event_category: category,
    event_label: JSON.stringify(label),
    value,
  });
};
