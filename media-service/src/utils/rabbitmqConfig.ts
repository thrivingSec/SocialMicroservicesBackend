import amqlib from "amqplib";

export const connectRabbitmqServer = async(url:string, exchName:string):Promise<boolean> => {
  try {
    globalThis.connection = await amqlib.connect(url);
    globalThis.channel = await globalThis.connection.createChannel();
    
    await globalThis.channel.assertExchange(exchName, "topic", {durable:false})
    
    return true;
  } catch (error:any) {
    console.log(error);
    throw error;
  }
};

export async function consumeTask(exchName:string , routingKey:string, callback:(message:Buffer) => Promise<void>){
  const q = await globalThis.channel.assertQueue("", { exclusive: true });
  await globalThis.channel.bindQueue(q.queue, exchName, routingKey);
  globalThis.channel.consume(q.queue, function (msg) {
    if (msg !== null) {
      callback(msg.content);
      globalThis.channel.ack(msg);
    }
  });
}

// 

