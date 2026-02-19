import http from 'http';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { initSockets } from './sockets/index.js';
import { setSocketUtils } from './controllers/bidController.js';

const start = async () => {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const socketUtils = initSockets(server);
  setSocketUtils(socketUtils);

  server.listen(ENV.PORT, () => {
    console.log(`TenderHub API listening on port ${ENV.PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

