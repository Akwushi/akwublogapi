const mongoose = require ("mongoose");

//function to connect
const dbConnect = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB Has Connected Sucessfully");
    }catch (error){
        console.log(Error.Message);
        process.exit(1);

    }
};

dbConnect();