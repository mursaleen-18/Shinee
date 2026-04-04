import userModel from "../models/userModel.js";

const sellerAuth = async (req, res, next) => {
  try {
    const userId = req.userId || req.body?.userId;
    if (!userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const user = await userModel.findById(userId).select("role sellerProfile");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.sellerProfile?.status !== "approved") {
      return res.json({
        success: false,
        message: "Seller account is not approved yet.",
      });
    }

    req.seller = user;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default sellerAuth;
