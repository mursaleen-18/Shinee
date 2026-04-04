import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "Men",
  subCategory: "Topwear",
  sizes: [],
  bestseller: false,
};

const SellerDashboard = () => {
  const { backendUrl, token, sellerProfile, fetchSellerStatus } = useContext(ShopContext);
  const [tab, setTab] = useState("analytics");
  const [productForm, setProductForm] = useState(emptyProduct);
  const [images, setImages] = useState({ image1: null, image2: null, image3: null, image4: null });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({ productsCount: 0, ordersCount: 0, unitsSold: 0, revenue: 0 });
  const [loading, setLoading] = useState(false);

  const isApproved = sellerProfile?.status === "approved";

  const sizeOptions = useMemo(() => ["S", "M", "L", "XL", "XXL"], []);

  const loadProducts = async () => {
    if (!token || !isApproved) return;
    try {
      const res = await axios.post(backendUrl + "/api/product/seller/list", {}, { headers: { token } });
      if (res.data.success) setProducts(res.data.products || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadOrders = async () => {
    if (!token || !isApproved) return;
    try {
      const res = await axios.post(backendUrl + "/api/orders/seller/orders", {}, { headers: { token } });
      if (res.data.success) setOrders(res.data.orders || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadAnalytics = async () => {
    if (!token || !isApproved) return;
    try {
      const res = await axios.post(backendUrl + "/api/orders/seller/analytics", {}, { headers: { token } });
      if (res.data.success) setAnalytics(res.data.analytics || analytics);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) fetchSellerStatus(token);
  }, [token]);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadAnalytics();
  }, [token, isApproved]);

  const toggleSize = (size) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    if (!isApproved) return;
    if (!productForm.sizes.length) {
      toast.error("Select at least one size");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("category", productForm.category);
      formData.append("subCategory", productForm.subCategory);
      formData.append("bestseller", String(productForm.bestseller));
      formData.append("sizes", JSON.stringify(productForm.sizes));

      Object.entries(images).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const res = await axios.post(backendUrl + "/api/product/seller/add", formData, { headers: { token } });
      if (!res.data.success) {
        toast.error(res.data.message || "Failed to add product");
        return;
      }

      toast.success(res.data.message || "Product submitted");
      setProductForm(emptyProduct);
      setImages({ image1: null, image2: null, image3: null, image4: null });
      loadProducts();
      loadAnalytics();
      setTab("products");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      const res = await axios.post(backendUrl + "/api/product/seller/remove", { id }, { headers: { token } });
      if (!res.data.success) {
        toast.error(res.data.message || "Failed to remove product");
        return;
      }
      toast.success("Product removed");
      loadProducts();
      loadAnalytics();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!token) return <div className="py-8">Please login to access seller dashboard.</div>;

  if (!isApproved) {
    return (
      <div className="py-8 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-3">Seller Dashboard</h2>
        <p className="text-gray-700 mb-2">
          Your seller status is: <span className="font-medium capitalize">{sellerProfile?.status || "none"}</span>
        </p>
        <p className="text-sm text-gray-600">
          Submit onboarding from profile and wait for admin approval before managing products/orders.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <h2 className="text-2xl font-semibold">Seller Dashboard</h2>

      <div className="flex flex-wrap gap-2">
        {["analytics", "products", "orders", "add"].map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`px-4 py-2 border rounded ${tab === name ? "bg-black text-white" : "bg-white"}`}
          >
            {name === "add" ? "Add Product" : name[0].toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>

      {tab === "analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card title="Products" value={analytics.productsCount} />
          <Card title="Orders" value={analytics.ordersCount} />
          <Card title="Units Sold" value={analytics.unitsSold} />
          <Card title="Revenue" value={`$${analytics.revenue.toFixed(2)}`} />
        </div>
      )}

      {tab === "products" && (
        <div className="space-y-2">
          <p className="text-lg font-medium">My Products</p>
          {!products.length && <p className="text-sm text-gray-600">No products yet.</p>}
          {products.map((p) => (
            <div key={p._id} className="border rounded p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={p.image?.[0]} alt="" className="w-14 h-14 object-cover rounded border" />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-600">${p.price}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    Status: {p.approvalStatus}
                    {p.moderationReason ? ` (${p.moderationReason})` : ""}
                  </p>
                </div>
              </div>
              <button onClick={() => removeProduct(p._id)} className="text-red-600 text-sm">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          <p className="text-lg font-medium">My Orders</p>
          {!orders.length && <p className="text-sm text-gray-600">No orders yet.</p>}
          {orders.map((order) => (
            <div key={order._id} className="border rounded p-3">
              <div className="flex justify-between text-sm">
                <p className="font-medium">Order #{order._id.slice(-6)}</p>
                <p>{new Date(order.date).toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-600">Status: {order.status}</p>
              <p className="text-sm text-gray-600">Seller amount: ${Number(order.sellerAmount || 0).toFixed(2)}</p>
              <div className="mt-2 text-sm">
                {(order.items || []).map((item, idx) => (
                  <p key={idx}>
                    {item.name} x {item.quantity} ({item.size})
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "add" && (
        <form onSubmit={submitProduct} className="max-w-2xl grid gap-3">
          <p className="text-lg font-medium">Add Product</p>
          <input
            required
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />
          <textarea
            required
            className="border rounded px-3 py-2"
            placeholder="Description"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Price"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            />
            <select
              className="border rounded px-3 py-2"
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <select
            className="border rounded px-3 py-2"
            value={productForm.subCategory}
            onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>

          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 border rounded text-sm ${
                  productForm.sizes.includes(size) ? "bg-black text-white" : ""
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {["image1", "image2", "image3", "image4"].map((key) => (
              <input
                key={key}
                type="file"
                accept="image/*"
                onChange={(e) => setImages((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }))}
              />
            ))}
          </div>

          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={productForm.bestseller}
              onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
            />
            Bestseller
          </label>

          <button disabled={loading} className="bg-black text-white rounded px-4 py-2 w-fit">
            {loading ? "Saving..." : "Add Product"}
          </button>
        </form>
      )}
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="border rounded p-4 bg-white">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

export default SellerDashboard;
