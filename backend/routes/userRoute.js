import express from 'express'
import { loginUser, registerUser, adminLogin, getProfile, updateProfile, updateAvatar, changePassword, logoutAll, resendVerification, removeAvatar } from '../controllers/userController.js';
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router();
userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/me', authUser, getProfile)
userRouter.post('/me/update', authUser, updateProfile)
userRouter.post('/me/avatar', authUser, upload.single('image'), updateAvatar)
userRouter.post('/me/avatar/remove', authUser, removeAvatar)
userRouter.post('/me/change-password', authUser, changePassword)
userRouter.post('/me/logout-all', authUser, logoutAll)
userRouter.post('/me/resend-verification', authUser, resendVerification)

export default userRouter