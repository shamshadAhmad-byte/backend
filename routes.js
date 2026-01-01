const express=require("express");
const {MongoClient, ObjectId}=require('mongodb');
const upload=require("./middlewere");
const fs=require("fs");

const router=express.Router();


const url='mongodb://localhost:27017';
const dbName='mydatabase';
const client=new MongoClient(url);
let collection;
async function connectDB(){
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db=client.db(dbName);
        collection=db.collection('mycollection');

    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
}
connectDB();

router.get("/events",async (req,res)=>{
    try {
        const query=req.query;

        if(query.event_id){
            if (!ObjectId.isValid(query.event_id)) {
                return res.status(400).json({ message: "Invalid event_id" });
            }
            const event_id=query.event_id;
            let findResult=await collection.findOne({_id: new ObjectId(event_id)});
            if(!findResult){
                return res.status(404).json({message:"Event not found"});
            }
            res.status(200).json({message: "Event fetched successfully",data:findResult});
        }
            const {type, limit, page}=query;
            const limitNum=parseInt(limit)||5;
            const pageNum=parseInt(page)||1;
            const skipNum=(pageNum-1)*limitNum;
            let findResult=await collection.find({type: type}).skip(skipNum).limit(limitNum).toArray();

            res.status(200).json({message: "Events fetched successfully",data:findResult});
    } catch (error) {
        console.log("Error fetching events:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
});

router.post("/events",upload.single("file"), async (req,res)=>{
    try {
        const file=req.file;
        if(!file){
            return res.status(400).json({message: "File upload failed"});
        }
        req.body.file = file.path;
        const insertResult=await collection.insertOne(req.body);
        res.status(201).json({message: "Event added successfully", data: insertResult});
    } catch (error) {
        console.log("Error adding event:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
})
router.put("/events/:id",upload.single("file"), async (req, res)=>{
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid event_id" });
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "No data provided to update" });
        }

        const result = await collection.findOneAndUpdate({ _id: new ObjectId(id) },{ $set: req.body },{ returnDocument: "after" });
        if (!result) {
             return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({message: "Event updated successfully",data: result});
    } catch (error) {
        console.log("Error updating event:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
})
router.delete("/events/:id", async (req, res)=>{
    try {
        const id=req.params.id;
        if(!ObjectId.isValid(id)){
            return res.status(400).json({message: "Invalid event_id"});
        }
        const result=await collection.findOne({_id: new ObjectId(id)});
        if(!result){
            return res.status(404).json({message: "Event not found"});
        }
        fs.unlink(result.file, (err)=>{
            if(err){
                console.log("Error deleting file:", err);
            }
        })
        const deleteResult=await collection.deleteOne({_id: new ObjectId(id)});
        res.status(200).json({message: "Event deleted successfully", data: deleteResult});
    } catch (error) {
        console.log("Error deleting event:", error);
        res.status(500).json({message: "Internal Server Error"});
    }
})
module.exports=router;