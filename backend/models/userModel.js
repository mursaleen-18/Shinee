import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  line1: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  zip: { type: String, default: "" },
  country: { type: String, default: "" }
}, { _id: false });

const userSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true, sparse: true, default: "" },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
  phone: { type: String, default: "" },
  // Support multiple addresses and a pointer to default address index
  addresses: { type: [addressSchema], default: [] },
  defaultAddressIndex: { type: Number, default: -1 },
  // Legacy single address kept for backward compatibility
  address: { type: addressSchema, default: () => ({}) },
  avatar: { type: String, default: "" },
  cartData: { type: Object, default: {} },
  // Profile extras
  dob: { type: Date },
  gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
  preferences: { type: Object, default: {} },
  // Email verification
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: "" },
  // Token versioning to support logout-all and token invalidation
  tokenVersion: { type: Number, default: 0 },
  // Seller onboarding data
  sellerProfile: {
    status: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    storeName: { type: String, default: "" },
    businessType: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    idDocumentType: { type: String, default: "" },
    idDocumentNumber: { type: String, default: "" },
    idDocumentUrl: { type: String, default: "" },
    addressProofUrl: { type: String, default: "" },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, default: "" },
  },

}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel
