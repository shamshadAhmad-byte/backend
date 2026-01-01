const http=require('http');
const express=require('express');
const router = require('./routes');


const app=express();
const server=http.createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v3/app", router)

server.listen(3000,()=>{
    console.log("Server is running on port no 3000")
})
