import RelatedProducts from "../components/RelatedProducts";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl, navigate } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [review, setReview] = useState({ rating: 5, comment: "" });

  const sellerLabel =
    productData?.sellerStoreName || productData?.sellerName || "Platform Seller";

  const fetchProductData = async () => {
    products.forEach((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
      }
    });
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const submitReview = async () => {
    if (!token) {
      toast.info("Please login to review this product");
      navigate("/login");
      return;
    }
    if (!productData?._id) return;

    try {
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
        setReview({ rating: 5, comment: "" });
        toast.success("Review saved");
      } else {
        toast.error(res.data.message || "Failed to save review");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
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
            <p className="font-medium mb-2">Rate this product</p>
            <div className="flex items-center gap-2 mb-2">
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
              <input
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Write a short review"
                className="flex-1 border rounded px-2 py-1"
              />
              <button onClick={submitReview} className="bg-black text-white px-3 py-1 rounded">
                Submit
              </button>
            </div>
            {!!productData?.reviews?.length && (
              <div className="space-y-1">
                {productData.reviews
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((r, idx) => (
                    <p key={idx}>
                      <span className="font-medium">{r.userName}</span> ({r.rating}/5):{" "}
                      {r.comment || "No comment"}
                    </p>
                  ))}
              </div>
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
