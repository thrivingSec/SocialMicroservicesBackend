import amqlib from "amqplib";
import { logger } from "./logger.js";


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

export async function publishTask(exchName:string, routingKey:string, message:Buffer){
  globalThis.channel.publish(exchName, routingKey, message);
  logger.info(`Published task to ${exchName} and queue ${routingKey}`);
}

export async function consumeTask(exchName:string, routingKey:string, callback:(msg:Buffer) => Promise<any>){
  const q = await globalThis.channel.assertQueue("", {exclusive:true});
  await globalThis.channel.bindQueue(q.queue, exchName, routingKey);
  globalThis.channel.consume(q.queue, function(msg){
    if(msg){
      callback(msg.content);
      globalThis.channel.ack(msg)
    }
  })
}

