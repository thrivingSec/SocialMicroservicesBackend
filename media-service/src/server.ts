import app from "./app.js";
import { deleteMedaiEventHandler, deleteUserEventHandler } from "./event/media.event.handler.js";
import { ENV } from "./shared/env.js";
import { connectDB } from "./utils/db.js";
import { logger } from "./utils/logger.js";
import { connectRabbitmqServer, consumeTask } from "./utils/rabbitmqConfig.js";

const PORT = ENV.PORT;

(function(){
  app.listen(PORT, () => {
    connectDB()
      .then((host) => {
        connectRabbitmqServer(ENV.RABBITMQ_URI, ENV.EXCHANGE_NAME1)
          .then(async(val) => {
            if(val){
              await consumeTask(ENV.EXCHANGE_NAME1, "delete.post", deleteMedaiEventHandler);
              await consumeTask(ENV.EXCHANGE_NAME1, "delete.user", deleteUserEventHandler);
              logger.info(`✅ Media service is running on http://localhost:${PORT}`);
              logger.info(`✅ Databse connecteted at ${host}`);
              logger.info(`✅ RabbitMQ databse connected.`);
              logger.info(`✅ Consumer registered for delete.post`);
              logger.info(`✅ Consumer registered for delete.user`);
            }
          })
          .catch(error => {
            logger.error(`❌ Error in connecting to rabbitmq, ${error}`)
          })
      })
      .catch(error => {
        logger.error(`❌ Error in connecting to mongodb, ${error}`)
      })
  })
})()