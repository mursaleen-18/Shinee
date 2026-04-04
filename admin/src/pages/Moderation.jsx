import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Moderation = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPending = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.post(
        backendUrl + "/api/product/moderation/pending",
        {},
        { headers: { token } }
      );
      if (res.data.success) setProducts(res.data.products || []);
      else toast.error(res.data.message || "Failed to load moderation queue");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (productId) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/product/moderation/approve",
        { productId },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Product approved");
        loadPending();
      } else {
        toast.error(res.data.message || "Approve failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const reject = async (productId) => {
    const reason = window.prompt("Rejection reason", "Insufficient product details");
    if (reason === null) return;
    try {
      const res = await axios.post(
        backendUrl + "/api/product/moderation/reject",
        { productId, reason },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Product rejected");
        loadPending();
      } else {
        toast.error(res.data.message || "Reject failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadPending();
  }, [token]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Product Moderation Queue</h3>
      {loading && <p>Loading...</p>}
      {!loading && !products.length && <p>No pending products.</p>}
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p._id} className="border rounded p-4 bg-white flex justify-between gap-4">
            <div className="text-sm space-y-1">
              <p className="font-semibold">{p.name}</p>
              <p>Seller: {p.sellerStoreName || p.sellerName || "Unknown"}</p>
              <p>Price: ${p.price}</p>
              <p>Category: {p.category} / {p.subCategory}</p>
              <p>Submitted: {new Date(p.date).toLocaleString()}</p>
              {p.image?.[0] && (
                <img src={p.image[0]} alt="" className="w-24 h-24 object-cover border rounded mt-2" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => approve(p._id)} className="px-3 py-2 bg-black text-white rounded text-sm">
                Approve
              </button>
              <button onClick={() => reject(p._id)} className="px-3 py-2 border rounded text-sm">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Moderation;
