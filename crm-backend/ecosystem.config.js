module.exports = {
  apps: [{
    name: "munnay-backend",
    script: "dist/index.js",
    watch: false,
    env: {
      NODE_ENV: "production"
    }
  }]
};
