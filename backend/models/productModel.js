import mongoose from "mongoose";

export const applyReviewSummary = (product) => {
    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const numReviews = reviews.length;
    const avgRating = numReviews
        ? Number(
            (
                reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / numReviews
            ).toFixed(1)
        )
        : 0;

    product.numReviews = numReviews;
    product.avgRating = avgRating;
    return product;
};

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    sellerId: { type: String, default: "" },
    sellerName: { type: String, default: "" },
    sellerStoreName: { type: String, default: "" },
    approvalStatus: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
    moderationReason: { type: String, default: "" },
    reviews: {
        type: [
            {
                userId: { type: String, required: true },
                userName: { type: String, default: "User" },
                rating: { type: Number, min: 1, max: 5, required: true },
                comment: { type: String, default: "" },
                date: { type: Number, required: true },
            }
        ],
        default: []
    },
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    size: { type: Array, required: true },
    bestseller: { type: Boolean },
    date: { type: Number, required: true }
})

productSchema.methods.recalculateReviewSummary = function () {
    return applyReviewSummary(this);
};

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
export default productModel
