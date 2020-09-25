module.exports = {
  env: {
    description: "podcast",
    siteTitle: "技術部",
    ogImage: "https://avatars2.githubusercontent.com/u/71766187?s=200&v=4",
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
