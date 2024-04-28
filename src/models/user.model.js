import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
          type:String,
          required:true,
          unique:true,
          lowercase:true,
          trim:true
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory:[
          {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Video"
          }
        ],
        password:{
          type:String,
          required:[true,"Password is required"]
        },
        refreshToken:{
          type:String
        }
    },
    {
        timestamps: true
    }
);
userSchema.pre("save",async function(next){
  if(!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password,10)
  next()
})

userSchema.methods.isPasswordCorrect=async function(next){
    return await bcrypt.compare(password, this.password)
      
}

export default mongoose.model("User", userSchema);
