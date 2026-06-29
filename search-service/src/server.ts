import app from "./app.js";
import { addPostIndexEventHandler, deletePostIndexEventHandler, deleteUserEventHandler, updatePostEventHandler } from "./events/search.event.handler.js";
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
              await consumeTask(ENV.EXCHANGE_NAME1, "create.post", addPostIndexEventHandler)
              await consumeTask(ENV.EXCHANGE_NAME1, "delete.post", deletePostIndexEventHandler)
              await consumeTask(ENV.EXCHANGE_NAME1, "delete.user", deleteUserEventHandler)
              await consumeTask(ENV.EXCHANGE_NAME1, "update.post", updatePostEventHandler)
              logger.info(`✅ Search service is running on http://localhost:${PORT}`);
              logger.info(`✅ Databse connecteted at ${host}`);
              logger.info(`✅ RabbitMQ databse connected.`);
              logger.info(`✅ Consumer registered for create.post`);
              logger.info(`✅ Consumer registered for delete.post`);
              logger.info(`✅ Consumer registered for delete.user`);
              logger.info(`✅ Consumer registered for update.post`);
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