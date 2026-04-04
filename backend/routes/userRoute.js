import express from 'express'
import { loginUser, registerUser, adminLogin, getProfile, updateProfile, updateAvatar, changePassword, logoutAll, resendVerification, removeAvatar, applySellerOnboarding, getSellerStatus, listSellerApplications, approveSellerApplication, rejectSellerApplication, removeSellerCompletely, clerkAuth } from '../controllers/userController.js';
import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router();
userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/clerk-auth', clerkAuth)
userRouter.post('/me', authUser, getProfile)
userRouter.post('/me/update', authUser, updateProfile)
userRouter.post('/me/avatar', authUser, upload.single('image'), updateAvatar)
userRouter.post('/me/avatar/remove', authUser, removeAvatar)
userRouter.post('/me/change-password', authUser, changePassword)
userRouter.post('/me/logout-all', authUser, logoutAll)
userRouter.post('/me/resend-verification', authUser, resendVerification)
userRouter.post('/seller/apply', authUser, upload.fields([{ name: 'idDocument', maxCount: 1 }, { name: 'addressProof', maxCount: 1 }]), applySellerOnboarding)
userRouter.post('/seller/status', authUser, getSellerStatus)
userRouter.post('/admin/seller-applications', adminAuth, listSellerApplications)
userRouter.post('/admin/seller-approve', adminAuth, approveSellerApplication)
userRouter.post('/admin/seller-reject', adminAuth, rejectSellerApplication)
userRouter.post('/admin/seller-remove', adminAuth, removeSellerCompletely)

export default userRouter
