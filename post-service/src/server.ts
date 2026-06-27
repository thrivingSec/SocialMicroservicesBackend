import app from "./app.js";
import { deleteUserEventHandler } from "./event/post.event.handler.js";
import { ENV } from "./shared/env.js";
import { connectDB } from "./utils/db.js";
import { logger } from "./utils/logger.js";
import { connectRabbitmqServer, consumeTask } from "./utils/rabbitmqConfig.js";

const PORT = ENV.PORT;
(function startServer() {
  app.listen(PORT, () => {
    connectDB()
      .then((host) => {
        connectRabbitmqServer(ENV.RABBITMQ_URI, ENV.EXCHANGE_NAME1)
          .then(async(val) => {
            if (val) {
              await consumeTask(ENV.EXCHANGE_NAME1, "delete.user", deleteUserEventHandler)
              logger.info(
                `✅ Post service is running on http://localhost:${PORT}`,
              );
              logger.info(`✅ Databse connecteted at ${host}`);
              logger.info(`✅ RabbitMQ conneted successfull.`);
              logger.info(`✅ Consumer registered for delete.user task.`);
            }
          })
          .catch((err) => {
            logger.error(`❌ Error while connection to rabbitmq server:${err}`);
          });
      })
      .catch((err) => {
        logger.error(`❌ Error while connecting to mongodb databse: ${err}`);
      });
  });
})();
