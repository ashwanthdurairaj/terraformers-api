const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Appointment = require('../models/appointmentModel')

const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);



//Encrypting text
function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Text send to encrypt function
// var hw = encrypt("Welcome to Tutorials Point...")
// console.log(hw)
// console.log(decrypt(hw))




// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password1, password2 } = req.body

  console.log(req.body)
  if (!username || !email || !password1 || !password2) {
    res.status(400)
    throw new Error('Please add all fields')
  }

  // Check if user exists
  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400).json({message:'User already Exists, give different email address'})
    return
    // throw new Error('User already exists')
  }

  // Hash password
  // const salt = await bcrypt.genSalt(10)
  // const hashedPassword = await bcrypt.hash(password1, salt)
  // Create user
  const user = await User.create({
    username,
    email,
    password:password1,
    startTime: '00:00',
    endTime: '00:00',
  })

  if (user) {
    res.status(201).json({
      status:'success',
      token: generateToken(user._id),
      user: {
        _id: user.id,
        name: user.username,
        email: user.email,  
      }
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user email
  
  const user = await User.findOne({ email })
  console.log(user)
  console.log(password)
  if (user && password == user.password) {
    res.json({
      token: generateToken(user._id),
      user: {
        _id: user.id,
        name: user.username,
        email: user.email,  
      }    })
  } else {
    res.status(400)
    throw new Error('Invalid credentials')
  }
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // res.status(200).json(req.user)
  console.log(req.body)
  const user = await User.find({_id: req.body.id})
  console.log(user[0])
  res.status(200).json(user[0])
})

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, 'fae32013r', {
    expiresIn: '30d',
  })
}

const clashChecker = (start1, end1, start2, end2) => {
  let start1Minutes, end1Minutes = convertToMinutes(start1, end1);
  let start2Minutes, end2Minutes = convertToMinutes(start2, end2);

  // Check for overlap
  if ((start1Minutes <= start2Minutes && start2Minutes < end1Minutes) ||
      (start2Minutes <= start1Minutes && start1Minutes < end2Minutes)) {
    return true; // There is a clash
  } else {
    return false; // There is no clash
  }
}

const convertToMinutes= (timeString1, timeString2) => {
  const [hours1, minutes1] = timeString1.split(':');
  const [hours2, minutes2] = timeString2.split(':');
  console.log(hours1, hours2)
  if(hours1 > hours2)
  {
    return parseInt(hours1) * 60 + parseInt(minutes1),parseInt(hours2 + 24) * 60 + parseInt(minutes2)
  }
  else
  {
    return parseInt(hours1) * 60 + parseInt(minutes1),parseInt(hours2) * 60 + parseInt(minutes2);
  }
}

const appointment = asyncHandler(async(req, res) => {
  const {title, agenda, startTime, endTime, guest, id} = req.body
  const Guest = await User.find({email:guest})
  const user = await User.find({_id:id})
  const guestAppointments = await Appointment.find({guest: Guest[0]._id})
  const userAppointments = await Appointment.find({user: user[0]._id})
  
  
  console.log(req.body, 'appoinment request by saran') //appoinment request by saran
  console.log(Guest, 'check whether harry can accomodate') //check whether harry can accomodate
  console.log(guestAppointments, 'guest Appointments')
  console.log(userAppointments, 'user Appointments')

  // // check whether appointment clashes with off time of guest
  const result1 = clashChecker(req.body.startTime, req.body.endTime, Guest[0].startTime, Guest[0].endTime)
  console.log(result1)

  // check whether appointment clashes with off time of user itself
  const result2 = clashChecker(req.body.startTime, req.body.endTime, user[0].startTime, user[0].endTime)
  console.log(result2)
  //check whether appointment clashes with other appointments of the guest
  let result3
  for(let i = 0; i < guestAppointments.length; i++)
  {
    if(!clashChecker(req.body.startTime, req.body.endTime, guestAppointments[i].startTime, guestAppointments[i].endTime))
    {
      result3 = true
      break
    }
  }
  //check whether appointment clashes with other appointments of the user
  let result4
  for(let i = 0; i < guestAppointments.length; i++)
  {
    if(!clashChecker(req.body.startTime, req.body.endTime, userAppointments[i].startTime, userAppointments[i].endTime))
    {
      result4 = true
      break
    }
  }
  console.log(result3)
  console.log(result4)
  if(result1)
  {
    res.json({message: 'appointment clashes with off time of guest'})
  }
  else if(result2)
  {
    res.json({message: 'appointment clashes with off time of yours'})
  }
  else if(result3)
  {
    res.json({message: 'appointment clashes with other appointments of the guest'})
  }
  else if(result4)
  {
    res.json({message: 'appointment clashes with other appointments of yours'})
  }
  else
  {
    const app = await Appointment.create({
      title,
      agenda,
      guest:Guest[0]._id,
      user: req.body.id,
      startTime,
      endTime
      })
      console.log(app)
      
      res.status(200).json({status: 'success'})
      
  }
})

const getData = asyncHandler(async(req, res) => {
  const users = await User.find()
  console.log(users)
  const data = []
  for(let i = 0; i < users.length; i++) {
    data.push(users[i].email)
  }
  res.status(200).json(data)
})

const edit = asyncHandler(async(req, res) => {
  console.log(req.body)
  const user = await User.findByIdAndUpdate(req.body.userid, {
    username: req.body.name,
    email: req.body.email,
    password: req.body.password,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
  }, {new:true})
  res.status(200).json({success:true})
})

const getApp = asyncHandler(async(req, res) => {
  console.log(req.user)
  const apps1 = await Appointment.find({user: req.user._id})
  const apps2 = await Appointment.find({guest: req.user._id})
  res.status(200).json(apps1.concat(apps2))
})

module.exports = {
  registerUser,
  loginUser,
  getMe,
  appointment,
  getData,
  edit,
  getApp
}
