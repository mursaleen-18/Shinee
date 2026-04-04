import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { sendShineEmail } from "../utils/email.js";
// import Stripe from "stripe";

//Global Variables
const currency = "usd";
const deliveryCharge = 10;
// Gateway initialize
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing order using COD Method

const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, adress } = req.body;
    const orderData = {
      userId,
      items,
      adress,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const buyer = await userModel.findById(userId).select("name email");
    if (buyer?.email) {
      await sendShineEmail({
        to: buyer.email,
        subject: "Order confirmation - Shine",
        title: "Your Order Has Been Placed",
        greeting: `Hi ${buyer.name || "Customer"},`,
        lines: [
          `Thank you for shopping with Shine. Your order (${newOrder._id}) has been placed successfully.`,
          "You can track the latest status from your Orders section in the app.",
        ],
      });
    }

    const sellerIds = [
      ...new Set(
        (items || [])
          .map((item) => String(item.sellerId || ""))
          .filter(Boolean)
      ),
    ];
    if (sellerIds.length) {
      const sellers = await userModel
        .find({ _id: { $in: sellerIds } })
        .select("name email sellerProfile");
      for (const seller of sellers) {
        await sendShineEmail({
          to: seller.email,
          subject: "New order received on Shine",
          title: "You Have a New Order",
          greeting: `Hello ${seller.sellerProfile?.storeName || seller.name || "Seller"},`,
          lines: [
            `A new customer order (${newOrder._id}) includes one or more of your products.`,
            "Please review the order from your Seller Dashboard and prepare fulfillment.",
          ],
        });
      }
    }

    return res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//  Placing order using Stripe Method
// const placeOrderStripe = async (req, res) => {
//   try {
//     const { userId, items, amount, adress } = req.body;
//     const { origin } = req.headers;
//     const orderData = {
//       userId,
//       items,
//       adress,
//       amount,
//       paymentMethod: "Stripe",
//       payment: false,
//       date: Date.now(),
//     };
//     const newOrder = new orderModel(orderData);
//     await newOrder.save();

//     const line_items = items.map((item) => ({
//       price_data: {
//         currency: currency,
//         product_data: {
//           name: item.name,
//         },
//         unit_amount: item.price * 100,
//       },
//       quantity: item.quantity,
//     }));

//     line_items.push({
//       price_data: {
//         currency: currency,
//         product_data: {
//           name: "Delivery Charges",
//         },
//         unit_amount: deliveryCharge * 100,
//       },
//       quantity: 1,
//     });
//     const session = await stripe.checkout.sessions.create({
//       success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
//       cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
//       line_items,
//       mode: "payment",
//     });
//     res.json({ success: true, session_url: session.url });
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // Verify Stripe Payment

// const verifyStripe = async (req, res) => {
//   const { orderId, success, userId } = req.body;
//   try {
//     if (success === "true") {
//       await orderModel.findByIdAndUpdate(orderId, { payment: true });
//       await userModel.findByIdAndUpdate(userId, { cartData: {} });
//       res.json({ success: true });
//     } else {
//       await orderModel.findByIdAndDelete(orderId);
//       res.json({ success: false });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// Placing order using razorpay method

// verifying razorpay payment.

// All Order data Admin Panel

const allOrder = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//  User Order Data For FrontEnd
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update order Status from admin Panel

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    if (order?.userId) {
      const buyer = await userModel.findById(order.userId).select("name email");
      if (buyer?.email) {
        await sendShineEmail({
          to: buyer.email,
          subject: "Order status update - Shine",
          title: "Your Order Status Has Changed",
          greeting: `Hi ${buyer.name || "Customer"},`,
          lines: [
            `Your order (${order._id}) status is now: ${status}.`,
            "Thank you for shopping with Shine.",
          ],
        });
      }
    }

    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Seller orders (only items belonging to seller)
const sellerOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const sellerId = String(userId);
    const orders = await orderModel.find({ "items.sellerId": sellerId }).sort({ date: -1 });

    const scopedOrders = orders
      .map((order) => {
        const sellerItems = (order.items || []).filter(
          (item) => String(item.sellerId || "") === sellerId
        );
        if (!sellerItems.length) return null;
        const sellerAmount = sellerItems.reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        );
        return {
          ...order.toObject(),
          items: sellerItems,
          sellerAmount,
        };
      })
      .filter(Boolean);

    res.json({ success: true, orders: scopedOrders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Seller quick analytics
const sellerAnalytics = async (req, res) => {
  try {
    const { userId } = req.body;
    const sellerId = String(userId);

    const sellerProducts = await productModel.find({ sellerId });
    const sellerProductIds = new Set(sellerProducts.map((p) => String(p._id)));
    const orders = await orderModel.find({ "items.sellerId": sellerId });

    let revenue = 0;
    let unitsSold = 0;
    for (const order of orders) {
      for (const item of order.items || []) {
        if (String(item.sellerId || "") === sellerId) {
          unitsSold += Number(item.quantity || 0);
          revenue += Number(item.price || 0) * Number(item.quantity || 0);
        } else if (sellerProductIds.has(String(item._id || ""))) {
          unitsSold += Number(item.quantity || 0);
          revenue += Number(item.price || 0) * Number(item.quantity || 0);
        }
      }
    }

    res.json({
      success: true,
      analytics: {
        productsCount: sellerProducts.length,
        ordersCount: orders.length,
        unitsSold,
        revenue,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  // verifyStripe,
  placeOrder,
  // placeOrderStripe,
  allOrder,
  userOrders,
  updateStatus,
  sellerOrders,
  sellerAnalytics,
};
