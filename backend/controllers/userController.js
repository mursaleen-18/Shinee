import validator from "validator"
import userModel from '../models/userModel.js'
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import instanceId from '../config/serverInstance.js'
import crypto from 'crypto'


const createToken = (id, tokenVersion = 0) => {
    return jwt.sign({ id, tokenVersion, instanceId }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User Doesn't Exists" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createToken(user._id, user.tokenVersion || 0)
            res.json({ success: "true", token })
        }
        else (
            res.json({ success: false, message: "Invalid credentials" })
        )
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }

}

//Route for user register

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User Already Exists" })
        }
        // validating email formate & password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter a valid email" })

        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter a Strong password" })

        }
        // Hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Creating new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })
        const user = await newUser.save()

    const token = createToken(user._id, user.tokenVersion || 0)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//Route for admin login 
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { 
                    email: process.env.ADMIN_EMAIL,
                    isAdmin: true 
                }, 
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({ success: true, token })
        }
        else {
            return res.json({ success: false, message: "Invalid admin credentials" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


export { loginUser, registerUser, adminLogin }

// Get current user's profile
export const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId).select('-password');
        if (!user) return res.json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Update current user's profile (name, phone, address)
export const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, addresses, defaultAddressIndex, dob, gender, preferences } = req.body;
        const update = {};
        if (typeof name === 'string') update.name = name;
        if (typeof phone === 'string') update.phone = phone;
        if (address && typeof address === 'object') {
            update.address = {
                line1: address.line1 || '',
                city: address.city || '',
                state: address.state || '',
                zip: address.zip || '',
                country: address.country || ''
            };
        }
        if (Array.isArray(addresses)) update.addresses = addresses;
        if (typeof defaultAddressIndex === 'number') update.defaultAddressIndex = defaultAddressIndex;
        if (dob) update.dob = dob;
        if (gender) update.gender = gender;
        if (preferences && typeof preferences === 'object') update.preferences = preferences;

        const user = await userModel.findByIdAndUpdate(userId, update, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Change password endpoint
export const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.json({ success: false, message: 'Missing password fields' });
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.json({ success: false, message: 'Current password is incorrect' });
        if (newPassword.length < 8) return res.json({ success: false, message: 'Password must be at least 8 characters' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ success: true, message: 'Password changed' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Logout from all devices - increment tokenVersion to invalidate prior tokens
export const logoutAll = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, { new: true }).select('-password');
        res.json({ success: true, message: 'Logged out from all devices', user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Resend verification token (simple implementation - returns token in response if email provider not configured)
export const resendVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.isVerified) return res.json({ success: false, message: 'Already verified' });
        const token = crypto.randomBytes(20).toString('hex');
        user.verificationToken = token;
        await user.save();
        // TODO: send email; for now return token so frontend can show or test
        res.json({ success: true, message: 'Verification token generated', token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Remove avatar
export const removeAvatar = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findByIdAndUpdate(userId, { avatar: '' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update avatar
export const updateAvatar = async (req, res) => {
    try {
        const { userId } = req.body;
        const file = req.file;
        if (!file) return res.json({ success: false, message: 'No image uploaded' })
        const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' })
        const user = await userModel.findByIdAndUpdate(userId, { avatar: result.secure_url }, { new: true }).select('-password')
        res.json({ success: true, user })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}