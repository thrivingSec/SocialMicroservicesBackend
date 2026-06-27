import mongoose, {Schema, Document, model, HydratedDocument} from "mongoose";
import argon2 from "argon2";

export interface IUSER extends Document {
  username:string;
  email:string;
  password:string;
  profilePic?:string;
  bio?:string;
  createdAt?:Date
  updatedAt?:Date
  comparePassword(candidate:string):Promise<boolean>
}

const userSchema = new Schema<IUSER>({
  username:{
    type:String,
    required:true,
    unique:true,
    trim:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true
  },
  password:{
    type:String,
    required:true,
  },
  profilePic:{
    type:String,
    default:null
  },
  bio:{
    type:String,
    default:null
  }
}, {
  timestamps:true
})

// pre hook
userSchema.pre<HydratedDocument<IUSER>>("save", async function(next:any){
  try {
    if(this.isModified("password")){
      this.password = await argon2.hash(this.password);
    }
  } catch (error:any) {
    next(error)
  }
})

// instance method
userSchema.methods.comparePassword = async function(this:IUSER, candiatePassword:string){
  try {
    return await argon2.verify(this.password, candiatePassword)
  } catch (error:any) {
    throw error
  }
}

// indexing database
userSchema.index({username:"text"});

const User = model<IUSER>("user", userSchema);

export default User;


