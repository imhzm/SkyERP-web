module.exports = {
  apps: [
    {
      name: "skyerp-web",
      script: "npm",
      args: "run start -- -p 3300 -H 127.0.0.1",
      env: {
        NODE_ENV: "production",
        PORT: "3300",
        HOSTNAME: "127.0.0.1",
        SMTP_HOST: "smtp.hostinger.com",
        SMTP_PORT: "465",
        SMTP_USER: "admin@skywaveads.com",
        SMTP_PASS: "Newjoker2k24$",
        SMTP_FROM_NAME: "Sky ERP",
        SMTP_FROM_EMAIL: "admin@skywaveads.com"
      }
    }
  ]
};
