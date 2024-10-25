const express = require('express');
const cors = require('cors');

const {SignUp,Login,AllAccounts,Request,PendingRequests,acceptRequest,AddPost,AllPosts,YourPosts,PrivateSetting,DeletePost,AddLike,AddCommemts} = require('./Endpoints.js')
const {verification,verificationforgeust} = require('./Middlewares.js')
const port = 5000;

const app = express();
app.use(express.json());
app.use(cors());

app.post("/SignUp" , SignUp);
app.post("/Login" , Login);
app.post("/AllAccounts" ,verification, AllAccounts)
app.post("/Request",verification , Request)
app.post("/PendingRequests" ,verification,PendingRequests )
app.post("/acceptRequest" ,verification,acceptRequest )
app.post("/Addpost" , verification,AddPost)
app.post("/allPost" ,verificationforgeust, AllPosts )
app.post("/YourPosts",verification,YourPosts)
app.post("/UpdatePrivateSetting" , verification,PrivateSetting)
app.post("/DeletePost" , verification , DeletePost)
app.post("/AddLike",verification,AddLike)
app.post("/AddCommemts",verification,AddCommemts)

app.listen(port,()=>{
    console.log("Server is running on port -> "+port);
})
