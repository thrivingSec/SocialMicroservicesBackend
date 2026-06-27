import app from "./app.js";
import { ENV } from "./shared/env.js";
import { logger } from "./utils/logger.js";

const PORT = ENV.PORT;
app.listen(PORT, () => {
  logger.info(`✅ API Gateway service is running on http://localhost:${PORT}`);
})