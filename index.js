const express = require ('express');
require('./config')
require('dotenv').config()
const cors = require ('cors');
const UserModel = require('./models/Users');
const Admin = require('./models/Admins')
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcryptjs');
const asyncHandler = require ('express-async-handler')
const {protect} = require ('./middlwares/authMiddleware')

//--JWT secret key 
const jwtKey = process.env.SECRET_KEY

const port = process.env.PORT;
const app = express()
app.use(cors())
app.use(express.json())




//Generate Jwt
const generateToken = (id) => {
  return jwt.sign({id},jwtKey,{ expiresIn: '30d' })
}



//*-------- registration
app.post('/register',protect ,  asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please add all fields')
  }

  //check if Admin already exists
  const userExist = await Admin.findOne({ email })
  if (userExist) {
    res.status(400)
    throw new Error('Admin already exist with a provided email')
  }

  //Hash Password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  //Create New Admin
  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword
  })

  if (admin) {
    res.status(201).json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
    })
  } else {
    res.status(400)
    throw new Error('Invalid Data')
  }
})
);










//*---------------------------- Login
app.post('/login', asyncHandler (async (req, res) => {
  const {email, password} = req.body

  //Check for Admin Email
  const admin = await Admin.findOne({email})

   //Check for Admin Password
   if(admin && (await bcrypt.compare(password,admin.password))) {
    res.json({
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id)
    })
   } else {
    res.status(400)
    throw new Error('Invalid credentials')
   }

})
);


//-------- Create User
app.post('/createUser',protect,(req,res)=>{
  UserModel.create(req.body)
  .then(users => res.json(users))
  .catch(err => res.status(500).json(err)); // Handling error properly
});




//-------- Users list
app.get('/',protect,(req,res)=>{
  UserModel.find()
  .then(users => res.json(users))
  .catch(err => res.json(err))
})



//-------- find user by id
app.get(`/getUser/:id`,protect, (req, res) => {
  const id = req.params.id;
  UserModel.findById({_id:id}) 
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    })
    .catch(err => res.status(500).json({ error: err.message }));
});


//-------- update user by id

app.put('/updateUser/:id',protect,(req,res)=>{
  const id = req.params.id;
  UserModel.findByIdAndUpdate({_id:id}, {
    name: req.body.name, email: req.body.email, age: req.body.age
  }) 
  .then(user => {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  })
  .catch(err => res.status(500).json({ error: err.message }));
})



//-------- Delete user by id


app.delete('/deleteUser/:id',protect, (req,res)=>{
  const id = req.params.id;
  UserModel.findByIdAndDelete({_id:id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
})



//listening on port 3000

app.listen(port, ()=>{
  console.log('server is running')
})