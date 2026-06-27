import app from "./app.js";
import { ENV } from "./shared/env.js";
import { connectDB } from "./utils/db.js";
import { logger } from "./utils/logger.js";
import { connectRabbitMQServer } from "./utils/rabbitmqConfig.js";

const PORT = ENV.PORT;

app.listen(PORT, () => {
  connectDB()
    .then((host) => {
      connectRabbitMQServer(ENV.RABBITMQ_URI, ENV.EXCHANGE_NAME)
        .then((val) => {
          if (val) {
            logger.info(
              `✅ Identity service is running on http://localhost:${PORT}`,
            );
            logger.info(`✅ Database connected at: ${host}`);
            logger.info(`✅ RabbitMQ connected at: ${host}`);
          }
        })
        .catch((err) => {
          logger.info(`❌ Error in connecting to rabbitmq: ${err}`);
        });
    })
    .catch((err) => {
      logger.error(`❌ Error from conncetDB :: ${err}`);
    });
});

process.on("unhandledRejection", (reason: string, promise: Promise<any>) => {
  logger.error("Unhandled rejections at", promise, " reason: ", reason);
});
