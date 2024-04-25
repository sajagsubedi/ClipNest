import mongoose from "mongoose";

// connectng to database
const connectDB = async() => {
try{  
  const connectionInstance=await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MONGODB!! DB HOST: ${connectionInstance.connection.host}`)
}catch(err){
  console.log("MONGODB connection failed!",err)
  process.exit(1)
}
};

// export of connectDB function
export default connectDB;