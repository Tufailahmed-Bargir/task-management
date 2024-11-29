import { PrismaClient } from '@prisma/client'
import express from 'express'
import {z} from 'zod'
import jwt from 'jsonwebtoken'
import bycrypt from 'bcrypt'
const jwtPassword = '123456'
const app = express()

const prisma = new PrismaClient()

app.use(express.urlencoded({extended:true}))
app.get('/', (req,res)=>{
    res.send('hellow world')
})
 
 
const signUpSchema = z.object({
    username:z.string().min(4,{message:"must be 4 char long"}),
    email:z.string().email().min(4,{message:"must be valid email"}),
    password:z.string().min(4,{message:"must be 4 char long"}),

})

app.post('/signup', async function(req,res){


try{
    const data = req.body;
console.log('data recieved is: ');
console.log(data);
const {username, email, password}=data;

    const validateUser = signUpSchema.safeParse(data)
     
    
    if(!validateUser.success){
        res.status(400).json({
            msg:"Invalid input feilds",
            error:validateUser.error.message
        })
    }

    const userExistCheck = await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(userExistCheck){
        res.json({
            msg:'user alreday exist! login instead'
        })
    }

    const hashPassword = await bycrypt.hash(password, 10)
    const user = await prisma.user.create({
        data:{
            name:username,
            email:email,
            password:hashPassword
        }
    })
    console.log(user);
    const token = jwt.sign({username}, jwtPassword)
    
    res.status(200).json({
        msg:"user registered success...",
        status:user,
        token
        
    })
}catch(e){
    console.log(e.message);
    
}

})

app.post('/users/signin',async function(req,res){
   
try{
    const {email, password}=req.body
    console.log('email is');
    console.log(email);
    
    
   const userExist = await prisma.user.findUnique({
    where:{
        email:email
    }
   })

   const verifyPassword =await bycrypt.compare(password, userExist.password)
   if(!verifyPassword){
    res.json({
        msg:'please input the correct password'
    })
   }

   if(!userExist){
    return res.status(411).json({
        msg:"user do not exits"
    })
   }

   const token = jwt.sign({email},jwtPassword)
res.json({
    msg:"user exits",
    token:token
})

}catch(e){
    console.log(e.message);
    
}
    
})


app.post('/create', async function(req, res) {
        try {
            // Extract token from authorization header
            const token = req.header('authorization');
            console.log('Token is:', token);
    
            // Check if token exists and extract it if it's in Bearer format
            if (!token ) {
                return res.status(401).json({ msg: 'You are not authorized to perform this action...' });
            }
            
            // const actualToken = token.split(' ')[1]; // Get the actual token
    
            // Verify the token
            const verifyToken = jwt.verify(token, jwtPassword);
            console.log('Verified Token:', verifyToken);
    
            // If verification is successful, proceed to create a new post
            const { title, desc, status, } = req.body;
    
            const newPost = await prisma.task.create({
                data: {
                    title: title,
                    desc: desc,
                    userId: verifyToken.id // Assuming you want to associate the post with the user
                }
            });
    
            return res.status(201).json({
                msg: "Post created successfully",
                newPost: newPost
            });
    
        } catch (e) {
            console.error(e.message);
            
            // Handle different types of errors
            if (e instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ msg: 'Invalid token' });
            } else {
                return res.status(500).json({ msg: 'Server error', error: e.message });
            }
        }
    });
 
// get the posts as per the ID

app.get('/posts/:id',async function(req,res){
    const id = req.params.id
    console.log('id is: ',id);
     

    const post = await prisma.posts.findUnique({
        where:{
            id:parseInt(id)
        }
    })
    
    if(!post){
        return res.json({
            msg:`post with id ${id} not found or it does not exits`
        })
    }
    res.status(200).json({
        post
    })
})

// update post with id

app.put('/posts/:id',async function(req,res){

    const id = parseInt(req.params.id)

    const post = await prisma.posts.findUnique({
        where:{
            id:id
        }
    })

    const {newTitle, newDesc}= req.body

    const updatePost = await prisma.posts.update({
        where:{
            id:id
        },
        data:{
            title:newTitle,
            desc:newDesc
        }
    })

    res.json({
        msg:'post updated success',
        updatePost
    })
})

// deleting a perticular post
app.delete('/posts/:id',async function(req,res){
    const id  = parseInt(req.params.id)

    const deletePost = await prisma.posts.delete({
        where:{
            id:id
        }
    })

    return res.json({
        msg:'post deleted success'
    })

})
app.listen(3000, ()=>{
    console.log('server started');
    
}) 
  