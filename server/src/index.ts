import { createApp } from './app';
import { getStore } from './config/db';
import { config } from './config/env';

// Ensure the data store is initialized (and loaded from disk, if present) before accepting traffic.
getStore();

const app = createApp();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Carbon Footprint Awareness Platform API listening on port ${config.port} (${config.nodeEnv})`);
});
