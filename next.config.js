module.exports = {
  env: {
    DESCRIPTION: "podcast",
    SITE_TITLE: "技術部",
    OG_IMAGE: "https://avatars2.githubusercontent.com/u/71766187?s=200&v=4",
    GOOGLE_ANALYTICS_ID: "UA-90317507-2",
    TWITTER_ID: "@gijutsubu_dev",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }

    return config;
  },
};
