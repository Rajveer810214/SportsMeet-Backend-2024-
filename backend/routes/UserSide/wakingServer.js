const express = require('express');
const router = express.Router();
router.use(express.json());
router.get('/wakingserver',(req,res)=>{
    res.status(200).json({success:true,message:"waking the server"})
})

module.exports = router;
