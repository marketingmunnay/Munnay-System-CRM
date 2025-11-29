#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const path = require('path');
const dns = require('dns');
const net = require('net');

const dnsPromises = dns.promises;

async function diagnoseDbConnectivity() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('No DATABASE_URL set — skipping DB connectivity diagnostics.');
    return;
  }

  let host = null;
  let port = 5432;
  try {
    const parsed = new URL(dbUrl);
    host = parsed.hostname;
    port = parsed.port ? Number(parsed.port) : port;
  } catch (err) {
    console.warn('Could not parse DATABASE_URL for diagnostics:', err && err.message);
    return;
  }

  console.log('DATABASE_URL host for diagnostics:', host, 'port:', port);

  // DNS lookups
  try {
    const a = await dnsPromises.resolve4(host);
    console.log('DNS A records:', a);
  } catch (e) {
    console.warn('resolve4 failed:', e && e.message);
  }
  try {
    const aaaa = await dnsPromises.resolve6(host);
    console.log('DNS AAAA records:', aaaa);
  } catch (e) {
    console.warn('resolve6 failed:', e && e.message);
  }

  // Try TCP connect (short timeout)
  await new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;
    const onFinish = (msg) => {
      if (finished) return;
      finished = true;
      console.log(msg);
      socket.destroy();
      resolve();
    };

    socket.setTimeout(5000);
    socket.once('connect', () => onFinish(`TCP connect to ${host}:${port} - success`));
    socket.once('timeout', () => onFinish(`TCP connect to ${host}:${port} - timeout`));
    socket.once('error', (err) => onFinish(`TCP connect to ${host}:${port} - error: ${err && err.message}`));
    socket.connect(port, host);
  });
}

async function run() {
  try {
    await diagnoseDbConnectivity();

    if (process.env.SKIP_MIGRATE === '1') {
      console.log('SKIP_MIGRATE=1 set — skipping migrations.');
    } else if (process.env.ALLOW_MIGRATE_ON_START === '0') {
      console.log('ALLOW_MIGRATE_ON_START=0 — skipping migrations.');
    } else {
      console.log('Running Prisma migrations: `npx prisma migrate deploy`');
      const opts = { stdio: 'inherit', env: process.env, shell: true };
      const res = spawnSync('npx prisma migrate deploy', opts);
      if (res.error) {
        console.error('Migration process error:', res.error);
        process.exit(1);
      }
      if (res.status !== 0) {
        console.error('`prisma migrate deploy` exited with non-zero status', res.status);
        if (process.env.ALLOW_START_ON_MIGRATE_FAILURE === '1') {
          console.warn('ALLOW_START_ON_MIGRATE_FAILURE=1 — continuing despite migration failure.');
        } else {
          process.exit(res.status || 1);
        }
      } else {
        console.log('Migrations applied successfully.');
      }
    }

    // Start the actual server (spawn a child so logs are clean)
    const serverPath = path.join(__dirname, 'dist', 'index.js');
    console.log('Starting server:', serverPath);
    const node = spawn('node', [serverPath], { stdio: 'inherit', env: process.env, shell: false });
    node.on('exit', (code, signal) => {
      if (signal) {
        console.log('Server process killed by signal', signal);
        process.exit(1);
      }
      process.exit(code);
    });
  } catch (err) {
    console.error('Unexpected error in run_and_migrate:', err);
    process.exit(1);
  }
}

run();
