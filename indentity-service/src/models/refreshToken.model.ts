import mongoose,{Schema, Document, model} from "mongoose";

export interface IREFRESHTOKEN extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const refreshTokenSchema = new Schema<IREFRESHTOKEN>({
  token:{
    type:String,
    required:true,
    unique:true
  },
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  expiresAt:{
    type: Date,
    required:true
  }
}, {
  timestamps:true
})

refreshTokenSchema.index({expiresAt: 1}, {expireAfterSeconds:0});

export const RefreshToken = model<IREFRESHTOKEN>("refreshToken", refreshTokenSchema);