import { ENV } from "./shared/env.js";
import { logger } from "./utils/logger.js";
import {
  createRabbitMQConnection,
  taskConsumer,
} from "./utils/rabbitmqConfig.js";
import { sendForgotPasswordMailTask, sendOnboardingMailTask, sendVerificationMailTask } from "./events/sendMailTask.js";
import app from "./app.js";

const PORT = ENV.PORT;

(function startServer() {
  app.listen(PORT, () => {
    createRabbitMQConnection(ENV.RABBITMQ_URI, ENV.EXCHANGE_NAME)
      .then(async (val) => {
        if (val) {
          await taskConsumer(
            ENV.EXCHANGE_NAME,
            "register.user",
            sendVerificationMailTask,
          );
          await taskConsumer(ENV.EXCHANGE_NAME, "onboarding.user", sendOnboardingMailTask);
          await taskConsumer(ENV.EXCHANGE_NAME, "forgotPassword", sendForgotPasswordMailTask)
          logger.info(
            `✅ Utils service is running on http://localhost:${PORT}`,
          );
          logger.info(`✅ Connected to rabbitmq server.`);
          logger.info(`✅ Consumer registered for 'register.user' task`);
          logger.info(`✅ Consumer registered for 'onboarding.user' task`);
          logger.info(`✅ Consumer registered for 'forgotPassword' task`);
        }
      })
      .catch((err) => {
         logger.error(`❌ Error while connection to rabbitmq server:${err}`);
      });
  });
})();
