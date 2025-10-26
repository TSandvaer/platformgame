module.exports = {
  apps: [{
    name: 'platformgame',
    script: 'server.js',

    // Environment
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // Process management
    instances: 1,
    exec_mode: 'fork',

    // Auto-restart on crashes
    autorestart: true,
    watch: false,  // Disable in production (use only for development)
    max_memory_restart: '1G',

    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,

    // Environment variables from .env file
    env_file: '.env'
  }]
};
