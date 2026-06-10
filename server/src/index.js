import app from "./app.js";
import config from "./config/env.js";

const PORT = config.port;
const NODE_ENV = config.nodeEnv;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
});
