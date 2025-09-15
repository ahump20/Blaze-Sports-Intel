// PM2 Production Configuration for Blaze Intelligence
module.exports = {
  apps: [{
    name: 'blaze-intelligence',
    script: 'server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Production optimizations
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart configuration
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: false,
    
    // Production features
    merge_logs: true,
    autorestart: true,
    
    // Kill timeout
    kill_timeout: 5000
  }]
};