const multer=require("multer");
const fs=require("fs");
const path=require("path");
const uploadPath = path.join(process.cwd(), "uploads");
const store=multer.diskStorage({
    destination: function(req,file,cb){
        if(!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null,uploadPath);
    },
    filename: function(req,file,cb){
        cb(null, Date.now()+"-"+file.originalname);
    }
})
module.exports=multer({storage: store})
