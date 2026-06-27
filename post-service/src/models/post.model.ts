import mongoose, {Document, Schema, model} from "mongoose";
import { text } from "node:stream/consumers";

export interface IPOST extends Document {
  user:mongoose.Types.ObjectId;
  content:string;
  mediaIds:string[];
  createdAt?:Date,
  updatedAt?:Date
}

const postSchmea = new Schema<IPOST>({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  content:{
    type:String,
    required:true
  },
  mediaIds:[
    {type:String}
  ],
  createdAt:{
    type:Date,
    default:Date.now
  }
}, {
  timestamps:true
})

postSchmea.index({content : "text"});

export const Post = model<IPOST>("post", postSchmea);