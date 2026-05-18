// PM2 process manager configuration
// Start with: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name:        "classroom-fund-api",
      script:      "./server/index.js",
      instances:   1,
      autorestart: true,
      watch:       false,
      max_memory_restart: "200M",
      env_production: {
        NODE_ENV: "production",
      },
      error_file:  "./logs/err.log",
      out_file:    "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
