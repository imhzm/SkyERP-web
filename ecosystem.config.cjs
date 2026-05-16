module.exports = {
  apps: [
    {
      name: "skyerp-web",
      script: "npm",
      args: "run start -- -p 3300 -H 127.0.0.1",
      env: {
        NODE_ENV: "production",
        PORT: "3300",
        HOSTNAME: "127.0.0.1"
      }
    }
  ]
};
