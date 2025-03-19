import 'dotenv/config'
import { connect_DB } from './db/index.js'
import { app } from './app.js';

const requiredEnvVars = ['PORT', 'MONGODB_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`Error: Missing required environment variable ${varName}`);
        process.exit(1);
    }
});

console.log("database connection started")
connect_DB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("failed to start express app",error)
        throw error
    });
    app.listen(process.env.PORT,()=>{
        console.log("server started successfully at port ", process.env.PORT)
        console.log("Listening for requests...")
    });
}).catch((err)=>{
    console.log("database connection failed",err)
    process.exit(1);
});