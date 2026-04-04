import express from "express"
import { listProduct, addProduct, removeProduct, singleProduct, addSellerProduct, listSellerProducts, removeSellerProduct, addProductReview, getSellerStore, listPendingProducts, approveProduct, rejectProduct } from '../controllers/productController.js'
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import sellerAuth from "../middleware/sellerAuth.js";

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), addProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProduct);
productRouter.post('/seller/add', authUser, sellerAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), addSellerProduct);
productRouter.post('/seller/list', authUser, sellerAuth, listSellerProducts);
productRouter.post('/seller/remove', authUser, sellerAuth, removeSellerProduct);
productRouter.post('/review', authUser, addProductReview);
productRouter.post('/store', getSellerStore);
productRouter.post('/moderation/pending', adminAuth, listPendingProducts);
productRouter.post('/moderation/approve', adminAuth, approveProduct);
productRouter.post('/moderation/reject', adminAuth, rejectProduct);

export default productRouter
