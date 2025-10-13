import express from "express";
import {
  placeOrder,
//   placeOrderStripe,
  allOrder,
  userOrders,
  updateStatus,
//   verifyStripe,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

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

// Verify Payment
// orderRouter.post("/verifyStripe", authUser, verifyStripe);
// orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)     // razorpay not added

export default orderRouter;
