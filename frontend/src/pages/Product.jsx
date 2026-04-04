import RelatedProducts from "../components/RelatedProducts";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { currency, addToCart, token, backendUrl, navigate, profile, refreshProducts } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const sellerLabel =
    productData?.sellerStoreName || productData?.sellerName || "Platform Seller";

  const renderStars = (ratingValue) => {
    const normalizedRating = Math.round(Number(ratingValue || 0));
    return Array.from({ length: 5 }, (_, index) => {
      const icon = index < normalizedRating ? assets.star_icon : assets.star_dull_icon;
      return <img key={index} src={icon} alt="" className="w-3.5" />;
    });
  };

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(backendUrl + "/api/product/single", { productId });
      if (res.data.success && res.data.product) {
        const nextProduct = res.data.product;
        setProductData(nextProduct);
        setImage((currentImage) =>
          nextProduct.image?.includes(currentImage) ? currentImage : nextProduct.image?.[0] || ""
        );
      } else {
        toast.error(res.data.message || "Product not found");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, backendUrl]);

  useEffect(() => {
    if (!productData) return;
    const existingReview = (productData.reviews || []).find(
      (item) => String(item.userId) === String(profile?._id || "")
    );

    if (existingReview) {
      setReview({
        rating: Number(existingReview.rating) || 5,
        comment: existingReview.comment || "",
      });
      return;
    }

    setReview({ rating: 5, comment: "" });
  }, [productData, profile?._id]);

  const submitReview = async () => {
    if (!token) {
      toast.info("Please login to review this product");
      navigate("/login");
      return;
    }
    if (!productData?._id) return;

    try {
      setIsSubmittingReview(true);
      const res = await axios.post(
        backendUrl + "/api/product/review",
        {
          productId: productData._id,
          rating: Number(review.rating),
          comment: review.comment,
        },
        { headers: { token } }
      );
      if (res.data.success) {
        setProductData(res.data.product);
        await refreshProducts?.();
        toast.success("Review saved");
      } else {
        toast.error(res.data.message || "Failed to save review");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const visibleReviews = (productData?.reviews || [])
    .slice()
    .sort((a, b) => Number(b.date || 0) - Number(a.date || 0));

  if (isLoading) {
    return <div className="border-t-2 pt-10 text-sm text-gray-500">Loading product...</div>;
  }

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                key={index}
                src={item}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {renderStars(productData.avgRating)}
            <p className="pl-2">({productData.numReviews || 0})</p>
          </div>
          <p className="mt-5 text-xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-2 text-sm text-gray-600">Sold by {sellerLabel}</p>
          {productData?.sellerId && (
            <button
              onClick={() => navigate(`/store/${productData.sellerId}`)}
              className="mt-2 text-sm text-blue-600 underline"
            >
              Visit Store
            </button>
          )}
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.size.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className=" text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product</p>
            <p>Cash on delivery is available on this product</p>
            <p>Easy return and exchange policy within 7 days</p>
            <p>
              Rating: {productData.avgRating || 0} / 5 ({productData.numReviews || 0} reviews)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews ({productData.numReviews || 0})</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            Upgrade your everyday style with this product. It is designed for daily comfort,
            quality, and durability.
          </p>
          <p>Perfect for regular wear with a clean, modern look.</p>
          <div className="border rounded p-3 text-gray-700">
            <p className="font-medium mb-2">
              {profile ? "Rate this product" : "Login to rate this product"}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <select
                value={review.rating}
                onChange={(e) => setReview({ ...review, rating: e.target.value })}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Write your review"
                rows={2}
                className="flex-1 border rounded px-2 py-1"
              />
              <button
                type="button"
                onClick={submitReview}
                disabled={isSubmittingReview}
                className="bg-black text-white px-3 py-1 rounded disabled:opacity-60"
              >
                {isSubmittingReview ? "Saving..." : "Save"}
              </button>
            </div>
            {visibleReviews.length ? (
              <div className="space-y-3">
                {visibleReviews.map((item) => (
                  <div key={item.userId} className="border-t pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-gray-900">{item.userName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">{renderStars(item.rating)}</div>
                        <span className="text-xs text-gray-500">
                          {new Date(Number(item.date || Date.now())).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{item.comment || "No comment"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
            )}
          </div>
        </div>
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : (
    <div className="opacity-0"> </div>
  );
};

export default Product;
