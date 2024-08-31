const mongoose=require('mongoose');
require('dotenv').config();
const db=()=>{
try {
    mongoose.connect(process.env.DATABASE);
    console.log("connected to mongodb successfully")    
} catch (error) {
    console.log("Some error occured")
}
}
module.exports =db;


