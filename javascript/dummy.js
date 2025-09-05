const express = require('express'); //https://fakestoreapiserver.reactbd.com/photos
const axios = require('axios');
const app = express();
app.get("/", async (req, res)=>{
    try {
        const response = await axios.get("https://fakestoreapiserver.reactbd.com/photos");
        res.json(
            response.data
        )
    }
    catch(error){
        res.status(500).json({
           msg:("kanishk is maha pagal")
       })
        
    };
});
app.listen(3002);