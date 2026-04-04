import { v2 as cloudinary } from 'cloudinary'
import productModel, { applyReviewSummary } from '../models/productModel.js';
import userModel from '../models/userModel.js';





//    Function for Add product 

const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )


        // Create product data in order to store in mongodb database
        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            size: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()

        }
        console.log(productData);
        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//    Function for list product 

const listProduct = async (req, res) => {
    try {
        const products = await productModel.find({ approvalStatus: "approved" })
        res.json({ success: true, products })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }


}

//    Function for Remove product 

const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//    Function for Single  product  info

const singleProduct = async (req, res) => {
    try {

        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({ success: true, product })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// Add product as seller
const addSellerProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
        const userId = req.userId || req.body?.userId;
        const seller = await userModel.findById(userId).select("name sellerProfile");
        if (!seller) return res.json({ success: false, message: "Seller not found" });

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)
        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            size: JSON.parse(sizes),
            image: imagesUrl,
            sellerId: String(userId),
            sellerName: seller.name || "",
            sellerStoreName: seller.sellerProfile?.storeName || "",
            approvalStatus: "pending",
            moderationReason: "Awaiting admin moderation",
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save()
        res.json({ success: true, message: "Product submitted for moderation" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// List products of current seller
const listSellerProducts = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const products = await productModel.find({ sellerId: String(userId) }).sort({ date: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Remove product owned by current seller
const removeSellerProduct = async (req, res) => {
    try {
        const { id } = req.body;
        const userId = req.userId || req.body?.userId;
        const product = await productModel.findOne({ _id: id, sellerId: String(userId) });
        if (!product) return res.json({ success: false, message: "Product not found for this seller" });
        await productModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Product Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Add or update product review by buyer
const addProductReview = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const { productId, rating, comment } = req.body;
        const safeRating = Number(rating);
        if (!productId || Number.isNaN(safeRating) || safeRating < 1 || safeRating > 5) {
            return res.json({ success: false, message: "Invalid review data" });
        }

        const user = await userModel.findById(userId).select("name");
        if (!user) return res.json({ success: false, message: "User not found" });

        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });

        const existingIndex = product.reviews.findIndex((r) => String(r.userId) === String(userId));
        const reviewPayload = {
            userId: String(userId),
            userName: user.name || "User",
            rating: safeRating,
            comment: typeof comment === "string" ? comment.trim() : "",
            date: Date.now(),
        };

        if (existingIndex >= 0) product.reviews[existingIndex] = reviewPayload;
        else product.reviews.push(reviewPayload);

        applyReviewSummary(product);

        await product.save();
        res.json({ success: true, message: "Review saved", product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Public store profile with products
const getSellerStore = async (req, res) => {
    try {
        const { sellerId } = req.body;
        if (!sellerId) return res.json({ success: false, message: "Seller id is required" });

        const seller = await userModel
            .findById(sellerId)
            .select("name sellerProfile")
            .lean();
        if (!seller) return res.json({ success: false, message: "Seller not found" });

        const products = await productModel
            .find({ sellerId: String(sellerId), approvalStatus: "approved" })
            .sort({ date: -1 })
            .lean();

        const totalReviews = products.reduce((sum, p) => sum + Number(p.numReviews || 0), 0);
        const avgRating = products.length
            ? Number(
                (
                    products.reduce((sum, p) => sum + Number(p.avgRating || 0), 0) / products.length
                ).toFixed(1)
            )
            : 0;

        res.json({
            success: true,
            store: {
                sellerId: String(sellerId),
                sellerName: seller.name || "",
                storeName: seller.sellerProfile?.storeName || "",
                businessType: seller.sellerProfile?.businessType || "",
                productsCount: products.length,
                avgRating,
                totalReviews,
            },
            products,
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Admin moderation queue list
const listPendingProducts = async (req, res) => {
    try {
        const products = await productModel
            .find({ approvalStatus: "pending" })
            .sort({ date: -1 });
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const approveProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.json({ success: false, message: "Product id is required" });
        await productModel.findByIdAndUpdate(productId, {
            approvalStatus: "approved",
            moderationReason: "",
        });
        res.json({ success: true, message: "Product approved" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const rejectProduct = async (req, res) => {
    try {
        const { productId, reason } = req.body;
        if (!productId) return res.json({ success: false, message: "Product id is required" });
        await productModel.findByIdAndUpdate(productId, {
            approvalStatus: "rejected",
            moderationReason: reason || "Rejected by admin moderation",
        });
        res.json({ success: true, message: "Product rejected" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export {
    listProduct,
    addProduct,
    removeProduct,
    singleProduct,
    addSellerProduct,
    listSellerProducts,
    removeSellerProduct,
    addProductReview,
    getSellerStore,
    listPendingProducts,
    approveProduct,
    rejectProduct,
}
