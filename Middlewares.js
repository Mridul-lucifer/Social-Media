const secret_key = "sdfghjkwertyuiorty7u8tyui456#$%^&*(dfghj"
const jwt = require('jsonwebtoken')
const verification = function(req,res,next){
    const token = req.headers.token
    
    if(!token){
        res.status(400).json({
            msg : "Token Required"
        })
    }else{
        try{
            req.user = jwt.verify(token,secret_key);
            next()
        }catch(error){
            res.status(400).json({
                msg : "Invalid Token.."
            })
        }
    }
}

const verificationforgeust = function(req,res,next){
    const token = req.headers.token
    if(!token){
        req.type = "guest"
        next()
    }else{
        try{
            req.user = jwt.verify(token,secret_key);
            if(req.user.UserName=="Admin"){
                req.type = "Admin";
            }else{
                req.type = "reg"
            }
            next()
        }catch(error){
            res.status(400).json({
                msg : "Invalid Token.."
            })
        }
    }
}




module.exports = {verification,verificationforgeust}