import validator from "validator"
import userModel from '../models/userModel.js'
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import instanceId from '../config/serverInstance.js'
import crypto from 'crypto'
import productModel from '../models/productModel.js'
import { sendShineEmail } from '../utils/email.js'
import { verifyToken } from '@clerk/backend'


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
            res.json({ success: true, token })
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

// Exchange Clerk session token for app JWT and local user account
export const clerkAuth = async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        const clerkToken = authHeader.toLowerCase().startsWith("bearer ")
            ? authHeader.slice(7).trim()
            : "";
        if (!clerkToken) {
            return res.json({ success: false, message: "Missing Clerk token" });
        }

        const verified = await verifyToken(clerkToken, { secretKey: process.env.CLERK_SECRET_KEY });
        if (!verified?.sub) {
            return res.json({ success: false, message: "Invalid Clerk token" });
        }

        const clerkId = String(verified.sub);
        const { email, name } = req.body;
        if (!email) return res.json({ success: false, message: "Email is required" });

        let user = await userModel.findOne({ clerkId });
        if (!user) {
            user = await userModel.findOne({ email });
            if (user) {
                user.clerkId = clerkId;
                if (!user.name && name) user.name = name;
                await user.save();
            }
        }

        if (!user) {
            const randomPassword = crypto.randomBytes(24).toString("hex");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);
            user = await userModel.create({
                clerkId,
                name: name || "User",
                email,
                password: hashedPassword,
            });
        }

        const token = createToken(user._id, user.tokenVersion || 0);
        res.json({ success: true, token, userId: user._id });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

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

// Resend verification token
export const resendVerification = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: 'User not found' });
        if (user.isVerified) return res.json({ success: false, message: 'Already verified' });
        const token = crypto.randomBytes(20).toString('hex');
        user.verificationToken = token;
        await user.save();
        // TODO: send email verification flow using provider.
        res.json({ success: true, message: 'Verification request accepted' });
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

// Buyer applies to become seller (KYC submission)
export const applySellerOnboarding = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const { storeName, businessType, gstNumber, idDocumentType, idDocumentNumber } = req.body;
        const idDocumentFile = req.files?.idDocument?.[0];
        const addressProofFile = req.files?.addressProof?.[0];

        if (!storeName || !idDocumentType || !idDocumentNumber || !idDocumentFile) {
            return res.json({ success: false, message: "Missing required onboarding fields" });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });

        if (user.sellerProfile?.status === "approved") {
            return res.json({ success: false, message: "Already an approved seller" });
        }

        const idDocumentUpload = await cloudinary.uploader.upload(idDocumentFile.path, { resource_type: "auto" });
        let addressProofUrl = "";
        if (addressProofFile) {
            const addressUpload = await cloudinary.uploader.upload(addressProofFile.path, { resource_type: "auto" });
            addressProofUrl = addressUpload.secure_url;
        }

        user.sellerProfile = {
            ...(user.sellerProfile || {}),
            status: "pending",
            storeName,
            businessType: businessType || "",
            gstNumber: gstNumber || "",
            idDocumentType,
            idDocumentNumber,
            idDocumentUrl: idDocumentUpload.secure_url,
            addressProofUrl,
            submittedAt: new Date(),
            approvedAt: undefined,
            rejectedAt: undefined,
            rejectionReason: "",
        };

        await user.save();
        res.json({ success: true, message: "Seller onboarding submitted for admin approval" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Current user's seller onboarding status
export const getSellerStatus = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId).select("role sellerProfile");
        if (!user) return res.json({ success: false, message: "User not found" });
        res.json({
            success: true,
            role: user.role,
            sellerProfile: user.sellerProfile || { status: "none" },
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Admin: list seller onboarding applications
export const listSellerApplications = async (req, res) => {
    try {
        const users = await userModel
            .find({ "sellerProfile.status": { $in: ["pending", "approved", "rejected"] } })
            .select("name email role sellerProfile")
            .sort({ "sellerProfile.submittedAt": -1 });

        res.json({ success: true, applications: users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Admin: approve seller onboarding
export const approveSellerApplication = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.json({ success: false, message: "User id is required" });

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });
        if (!user.sellerProfile || user.sellerProfile.status === "none") {
            return res.json({ success: false, message: "No seller application found" });
        }

        user.role = "seller";
        user.sellerProfile.status = "approved";
        user.sellerProfile.approvedAt = new Date();
        user.sellerProfile.rejectionReason = "";
        await user.save();

        await sendShineEmail({
            to: user.email,
            subject: "Your seller account is now active on Shine",
            title: "Seller Onboarding Approved",
            greeting: `Hi ${user.name},`,
            lines: [
                "We are pleased to let you know that your seller onboarding has been approved.",
                "You can now access your Seller Dashboard, list products, and start receiving orders on Shine.",
            ],
            ctaText: "Open Seller Dashboard",
            ctaUrl: process.env.SELLER_DASHBOARD_URL || process.env.FRONTEND_URL || "",
        });

        res.json({ success: true, message: "Seller onboarding approved" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Admin: reject seller onboarding
export const rejectSellerApplication = async (req, res) => {
    try {
        const { userId, rejectionReason } = req.body;
        if (!userId) return res.json({ success: false, message: "User id is required" });

        const user = await userModel.findById(userId);
        if (!user) return res.json({ success: false, message: "User not found" });
        if (!user.sellerProfile || user.sellerProfile.status === "none") {
            return res.json({ success: false, message: "No seller application found" });
        }

        user.role = "buyer";
        user.sellerProfile.status = "rejected";
        user.sellerProfile.rejectedAt = new Date();
        user.sellerProfile.rejectionReason = rejectionReason || "Application rejected by admin";
        await user.save();

        await sendShineEmail({
            to: user.email,
            subject: "Update required for your seller onboarding",
            title: "Seller Onboarding Update",
            greeting: `Hi ${user.name},`,
            lines: [
                "Your seller onboarding submission could not be approved at this time.",
                `Reason provided by admin: ${user.sellerProfile.rejectionReason}`,
                "Please update your details and submit the onboarding request again from your profile.",
            ],
        });

        res.json({ success: true, message: "Seller onboarding rejected" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Admin: permanently remove seller and their catalog
export const removeSellerCompletely = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.json({ success: false, message: "User id is required" });

        const seller = await userModel.findById(userId);
        if (!seller) return res.json({ success: false, message: "Seller not found" });
        if (seller.sellerProfile?.status === "none" && seller.role !== "seller") {
            return res.json({ success: false, message: "User is not a seller" });
        }

        await productModel.deleteMany({ sellerId: String(userId) });
        await userModel.findByIdAndDelete(userId);

        await sendShineEmail({
            to: seller.email,
            subject: "Your seller account has been removed",
            title: "Seller Account Removed",
            greeting: `Hi ${seller.name},`,
            lines: [
                "Your seller account has been removed from the Shine platform by the admin team.",
                "If you believe this was a mistake, please contact support.",
            ],
        });

        res.json({ success: true, message: "Seller removed from platform successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
