module.exports = {
  apps: [
    {
      name: 'docs-alazab',
      script: 'node',
      args: '.output/server/index.mjs',
      cwd: '/var/www/docs-alazab',
      env: {
        NODE_ENV: 'production',
        PORT: 4010
      }
    }
  ]
}
