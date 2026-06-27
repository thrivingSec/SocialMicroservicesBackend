import amqplib from "amqplib";

export const createRabbitMQConnection = async(url:string, exchName:string) => {
  try {
    globalThis.connection = await amqplib.connect(url);
    globalThis.channel = await globalThis.connection.createChannel()
    globalThis.channel.assertExchange(exchName, "topic", {durable:false});
    return true;
  } catch (error:any) {
    throw error
  }
}

export const taskConsumer = async(exchName:string, routingKey:string, callback:(message:Buffer) => Promise<void>) =>{
  const q = await globalThis.channel.assertQueue('', {exclusive:true});
  await globalThis.channel.bindQueue(q.queue, exchName, routingKey);
  await channel.consume(q.queue, function(msg){
    if(msg !== null){
      callback(msg.content);
      globalThis.channel.ack(msg)
    }
  })
}