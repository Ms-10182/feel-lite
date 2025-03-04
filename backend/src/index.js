import 'dotenv/config'
import { connect_DB } from './db/index.js'
import { app } from './app.js';

console.log("database connection started")
connect_DB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("failed to start express app",error)
        throw error
    });
    app.listen(process.env.PORT,()=>{
        console.log("app started sucessfully")
    });
}).catch((err)=>{
    console.log("database connection faild",err)
});