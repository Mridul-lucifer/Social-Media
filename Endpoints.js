const userFile = './Database/UserDetails.json'
const FollowFile  = './Database/FollowSystem.json'
const ContentFile = './Database/Content.json'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {readDatabase , writeDatabase} = require('./databaseCommands.js');

const secret_key = "sdfghjkwertyuiorty7u8tyui456#$%^&*(dfghj"
// assuming on input variables as Name , email , phone , password 
const SignUp = function(req,res){
    const userDetails = readDatabase(userFile);
    let msg = "";
    for(let i = 0 ; i < userDetails.length ;i++){
        if(userDetails[i].Name == req.body.Name){
            msg += "User Name "
        }
        if(userDetails[i].Phone==req.body.Phone ){
            msg += "Phone No. "
        }
        if(userDetails[i].Email==req.body.Email){
            msg += "Email "
        }
    }
    if(msg != ""){
        return res.status(400).json({
            msg : msg+"is already registered"
        })
    }
    let id = -1;
    if(userDetails.length==0){
        id = 1;
    }else{
        id = userDetails[userDetails.length-1].Id+1;
    }
    //Creating user-details-account
    const hashedPassword = bcrypt.hashSync(req.body.Password,8);
    const NewUser = {
        Id : id,
        Name : req.body.Name,
        Email : req.body.Email,
        Phone : req.body.Phone,
        Password : hashedPassword,
        isPrivate : req.body.isPrivate | false,
        Role : "Registered"
    }
    userDetails.push(NewUser);
    //Creating user-content-page
    const NewContent = {
        Id : id,
        Content : []
    }
    writeDatabase(userFile,userDetails);
    return res.status(200).json({
        msg : "Updated Successfully"
    })
}

const Login = function(req,res){
    const userDetails = readDatabase(userFile);
    let index = -1;
    for(let i = 0 ; i < userDetails.length;i++){
        if(userDetails[i].Name==req.body.Name && bcrypt.compareSync(req.body.Password,userDetails[i].Password)){
            index = i;
            break;
        }
    }
    if(index==-1){
        return res.status(400).json({
            msg : "UserName or Password is not correct"
        })
    }
    const token = jwt.sign({UserName : userDetails[index].Name} ,secret_key);
    return res.status(202).json({
        msg : "Welcome "+userDetails[index].Name+" and you are roled as "+userDetails[index].Role,
        token : token
    })
}

const AllAccounts  = function(req,res){
    const userDetails = readDatabase(userFile);
    const array = [];
    for(let i = 0; i < userDetails.length ; i++){
        if(userDetails[i].Name!=req.user.UserName){
            const temp = {
                Id : userDetails[i].id,
                Name : userDetails[i].Name
            }
            array.push(temp);
        }
    }
    return res.status(200).json(array);
}

const Request = function(req,res){
    const FollowSystem = readDatabase(FollowFile);
    const newRequest = {
        isAccepted : false,
        from : req.user.UserName,
        to : req.body.Name
    }
    FollowSystem.push(newRequest);
    writeDatabase(FollowFile,FollowSystem);
    return res.status(200).json({
        msg : "Done"
    })
}

const PendingRequests = function(req,res){
    const FollowSystem = readDatabase(FollowFile);
    let array = [];
    for(let i = 0 ; i < FollowSystem.length;i++){
        if(req.user.UserName==FollowSystem[i].to && FollowSystem[i].isAccepted==false){
            array.push(FollowSystem[i].from);
        }
    }
    return res.status(200).json(array);
}

const acceptRequest = function(req,res){
    const FollowSystem = readDatabase(FollowFile)
    for(let i = 0 ; i < FollowSystem.length ;i++){
        if(req.user.UserName == FollowSystem[i].to && req.body.Name == FollowSystem[i].from ){
            FollowSystem[i].isAccepted = true;
            writeDatabase(FollowFile,FollowSystem)
            return res.status(200).json({
                msg : "Accepted Successfully"
            })
        }
    }
    return res.status(400).json({
        msg : "Error either to or from is not there"
    })
}

const AddPost = function(req,res){
    const Content = readDatabase(ContentFile);
    const timeInIST = new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });
    let id ;
    if(Content.length()==0){
        id = 1;
    }else{
        id = Content[Content.length-1]+1;
    }
    const newPost = {
        Id : id,
        OwnerName : req.user.UserName,
        Post : req.body.message,
        Likes : [],
        Comment : [],
        Time : timeInIST
    }
    Content.push(newPost)
    writeDatabase(ContentFile,Content);
    return res.status(200).json({
        msg : "Post Added"
    })
}

const AllPosts = function(req,res){
    const userDetails = readDatabase(userFile);
    const FollowSystem = readDatabase(FollowFile);
    const Content = readDatabase(ContentFile);
    let arrayOfPublic = [];
    let arrayOfPrivate = [];
    let arrayPost = [];
    let arrayofprivatefollowing =[];
    if(req.type=="Admin"){
        return res.status(200).json({ 
            msg:"Your are Admin so only this ",
            posts:Content
        })
    }
    for(let i = 0 ; i < userDetails.length;i++){
        if(userDetails[i].isPrivate==false){
            arrayOfPublic.push(userDetails[i].Name)
        }else{
            arrayOfPrivate.push(userDetails[i].Name)
        }
    }
    for(let i = 0 ; i < Content.length;i++){
        for(let j = 0 ; j < arrayOfPublic.length;j++){
            if(Content[i].OwnerName==arrayOfPublic[j] && Content[i].OwnerName!=req.user.UserName){
                arrayPost.push(Content[i]);
            }
        }
    } 
    if(req.type=="guest"){
        return res.status(200).json({ 
            msg:"Your are guest so only this ",
            posts:arrayPost
        })
    }
    // add private accounts posts by first checking in 
    for(let i = 0 ; i < FollowSystem.length;i++){
        if(FollowSystem[i].isAccepted==true&&FollowSystem[i].from==req.user.UserName){
            for(let j = 0;j < arrayOfPrivate.length;j++){
                if(FollowSystem[i].to==arrayOfPrivate[j] && Content[i].OwnerName!=req.user.UserName){
                    arrayofprivatefollowing.push(arrayOfPrivate[j]);
                }
            }
        }
    }
    for(let i = 0 ; i < Content.length;i++){
        for(let j = 0 ; j < arrayofprivatefollowing.length;j++){
            if(Content[i].OwnerName==arrayofprivatefollowing[j]){
                arrayPost.push(Content);
            }
        }
    } 
    return res.status(200).json({
        msg:"Your are reg so only this ",
        posts:arrayPost
    })
    
}

const YourPosts = function(req,res){
    const Content = readDatabase(ContentFile);
    let arrayPost = [];
    for(let i = 0 ; i < Content.length;i++){
        if(Content[i].OwnerName==req.user.UserName){
            arrayPost.push(Content[i]);
        }
    }
    return res.status(200).json({
        msg:"Your are "+req.user.UserName+" so only this ",
        posts:arrayPost
    })
}

const PrivateSetting = function(req,res){
    const UserDetails = readDatabase(userFile);
    let index = -1;
    for(let i = 0; i < UserDetails.length ; i++){
        if(UserDetails[i].Name == req.user.UserName){
            index = i;
            break;
        }
    }
    if(i==-1){
        return res.status(400).json({
            msg : "there is some problem"
        })
    }
    UserDetails[i].isPrivate = req.body.isPrivate;
    writeDatabase(userFile,UserDetails);
    return res.status(200).json({
        msg : "Updated Succefully"
    })
}

const DeletePost = function(req,res){
    const Content = readDatabase(ContentFile);
    for(let i= 0; i< Content.length;i++){
        if(req.body.PostId==Content[i].Id && req.user.UserName == Content[i].OwnerName){
            Content.splice(i,i+1);
            writeDatabase(ContentFile,Content);
            return res.status(200).json({
                msg : "Post Deleted Successfully"
            })
        }
    }
    return res.status(400).json({
        msg : "Error ocurred "
    })
}

const AddLike = function(req,res){
    const userDetails = readDatabase(userFile);
    const FollowSystem = readDatabase(FollowFile);
    const Content = readDatabase(ContentFile);
    const isAccountprivate = false;
    for(let i = 0 ; i < userDetails.length;i++){
        if(req.body.OwnerName==userDetails[i].Name){
            isAccountprivate = userDetails[i].isPrivate;
            break;
        }
    }
    if(isAccountprivate==true){
        for(let i = 0 ;i < FollowSystem.length;i++){
            if(!(FollowSystem[i].from == req.user.UserName && FollowSystem[i].to == req.body.OwnerName && FollowSystem[i].isAccepted==true)){
                return res.status(400).json({
                    msg :"You cant like that post "
                })
            }
        }
    }
    for(let i = 0 ; i < Content.length;i++){
        if(Content[i].Id == req.body.UserId ){
            for(let j = 0 ; j < Content[i].Likes.length;j++){
                if(Content[i].Likes[j]==req.user.UserName){
                    return res.status(400).json({
                        msg : "Already Liked "
                    })
                }
            }
            Content[i].Likes.push(req.user.UserName);
            writeDatabase(ContentFile,Content);
        }
    }
    return res.status(200).json({
        msg : "Liked Successfully"
    })
}

const AddCommemts = function(req,res){
    
}

module.exports = {SignUp,Login,AllAccounts,Request,PendingRequests,acceptRequest,AddPost,AllPosts,YourPosts,PrivateSetting,DeletePost,AddLike,AddCommemts}