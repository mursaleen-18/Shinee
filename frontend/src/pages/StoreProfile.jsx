import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import ProductItem from "../components/ProductItem";

const StoreProfile = () => {
  const { sellerId } = useParams();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStore = async () => {
    try {
      setLoading(true);
      const res = await axios.post(backendUrl + "/api/product/store", { sellerId });
      if (res.data.success) {
        setStore(res.data.store);
        setProducts(res.data.products || []);
      } else {
        toast.error(res.data.message || "Failed to load store");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) loadStore();
  }, [sellerId]);

  if (loading) return <div className="py-8">Loading store...</div>;
  if (!store) return <div className="py-8">Store not found.</div>;

  return (
    <div className="py-8 border-t">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{store.storeName || store.sellerName}</h1>
        <p className="text-sm text-gray-600">Seller: {store.sellerName}</p>
        {store.businessType && <p className="text-sm text-gray-600">Business type: {store.businessType}</p>}
        <div className="mt-2 text-sm text-gray-700 flex gap-4">
          <p>Products: {store.productsCount}</p>
          <p>Store rating: {store.avgRating || 0} / 5</p>
          <p>Total reviews: {store.totalReviews || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
        {products.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            sellerStoreName={item.sellerStoreName}
            sellerName={item.sellerName}
          />
        ))}
      </div>
    </div>
  );
};

export default StoreProfile;
