import mongoose, {Schema, Document, model} from "mongoose";

export interface ISEARCH extends Document {
  postId:mongoose.Types.ObjectId;
  user:mongoose.Types.ObjectId;
  content:string;
  createdAt:Date;
  updatedAt?:Date
}

const searchSchema = new Schema<ISEARCH>({
  postId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"Post",
    unique:true
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User",
    index:true
  },
  content:{
    type:String,
    required:true
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
}, {
  timestamps:true
})

searchSchema.index({content:"text"});
searchSchema.index({createdAt:-1});

export const Search = model("search", searchSchema);
