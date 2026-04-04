import express from "express";
import {
  placeOrder,
//   placeOrderStripe,
  allOrder,
  userOrders,
  updateStatus,
  sellerOrders,
  sellerAnalytics,
//   verifyStripe,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import sellerAuth from "../middleware/sellerAuth.js";

const orderRouter = express.Router();

//Admin Features

orderRouter.post("/list", adminAuth, allOrder);
orderRouter.post("/status", adminAuth, updateStatus);

// Payment Features

orderRouter.post("/place", authUser, placeOrder);
// orderRouter.post("/stripe", authUser, placeOrderStripe);
// orderRouter.post('/razorpay', authUser, placeOrderRazorpay)    // razorpay not added

//User Features

orderRouter.post("/userorders", authUser, userOrders);
orderRouter.post("/seller/orders", authUser, sellerAuth, sellerOrders);
orderRouter.post("/seller/analytics", authUser, sellerAuth, sellerAnalytics);

// Verify Payment
// orderRouter.post("/verifyStripe", authUser, verifyStripe);
// orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)     // razorpay not added

export default orderRouter;
