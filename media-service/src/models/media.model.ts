import mongoose, {Schema, Document, model} from "mongoose";

export interface IMEDIA extends Document {
  publicId:string,
  originalName:string,
  mimeType:string,
  url:string,
  user:mongoose.Types.ObjectId,
  createdAt?:Date,
  updatedAt?:Date
}

const mediaSchema = new Schema<IMEDIA>({
  publicId:{
    type:String,
    required:true
  },
  originalName:{
    type:String,
    required:true
  },
  mimeType:{
    type:String,
    required:true
  },
  url:{
    type:String,
    required:true
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
}, {
  timestamps:true
})

export const Media = model<IMEDIA>("media", mediaSchema);
