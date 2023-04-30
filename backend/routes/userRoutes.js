const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  appointment,
  getData,
  edit,
  getApp
} = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/me', protect, getMe)
router.post('/appointment', protect, appointment)
router.get('/data', protect, getData)
router.post('/edit', protect, edit)
router.get('/getApp', protect, getApp)

module.exports = router
