import amqplib from "amqplib";

export async function connectRabbitMQServer(url: string, exchName: string) {
  try {
    global.connection = await amqplib.connect(url);
    global.channel = await connection.createChannel();
    await global.channel.assertExchange(exchName, "topic", { durable: false });
    return true;
  } catch (error) {
    console.log("RabbitMQ connection error :: ", error);
    throw error;
  }
}

export async function publishTask(exchName:string, routingKey:string, message:Buffer){
  global.channel.publish(exchName, routingKey, message);
}
