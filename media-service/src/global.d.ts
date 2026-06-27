import {Channel} from "amqplib";
declare global {
  var connection:any;
  var channel:Channel
}

export {}