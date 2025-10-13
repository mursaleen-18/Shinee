import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets";      // later removed when implementing API.
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState(null);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }
    // If user is not logged in, prompt to login or continue as guest.
    if (!token) {
      const goLogin = window.confirm('You are not logged in. Press OK to login or Cancel to continue as guest.');
      if (goLogin) {
        navigate('/login')
        return;
      }
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };
  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items])
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          toast.error(error.message);  // this code is my experiment
        }
    }
    return totalCount;
  };
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);  // this code is my experiment
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (!itemInfo) continue;
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {
          console.log(error);
          toast.error(error.message);
        }
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // More user-friendly error message
      if (error.code === "ERR_NETWORK") {
        toast.error("Network error: Please check if the backend server is running");
      } else if (error.response) {
        toast.error(error.response.data.message || "Error fetching products");
      } else {
        toast.error("Failed to fetch products. Please try again later.");
      }
    }
  };

  // Axios response interceptor to detect token/server restart issues
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        try {
          const msg = err?.response?.data?.message || ''
          if (/(Token expired|Server restarted|Not Authorized)/i.test(msg)) {
            // clear token and profile
            setToken('')
            localStorage.removeItem('token')
            setProfile(null)
            toast.info('Session expired. Please login again.')
            navigate('/login')
          }
        } catch (e) {
          console.log('Interceptor error', e)
        }
        return Promise.reject(err)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [navigate])

  useEffect(() => {
    getProductsData();
  }, [backendUrl]);

  useEffect(() => {
    // run once on mount: restore token from localStorage if present
    const t = localStorage.getItem('token')
    if (t) {
      setToken(t);
      getUserCart(t);
      fetchProfile(t);
    }
  }, [])

  // Get User Cart from Backend. (so that whenever the user logs in, we can fetch their cart)
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Fetch and cache profile
  const fetchProfile = async (tokenToUse = token) => {
    if (!tokenToUse) return;
    try {
      const res = await axios.post(backendUrl + '/api/user/me', {}, { headers: { token: tokenToUse } });
      if (res.data.success) {
        setProfile(res.data.user);
      }
    } catch (error) {
      console.log('Failed to fetch profile', error);
    }
  }

  const logoutAll = async () => {
    if (!token) return;
    try {
      await axios.post(backendUrl + '/api/user/me/logout-all', {}, { headers: { token } });
    } catch (error) {
      console.log(error);
    } finally {
      setToken('');
      localStorage.removeItem('token');
      setProfile(null);
      setCartItems({});
      navigate('/login');
    }
  }

  // Context Value (so that we can access it in other components)
  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    setCartItems,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken: (t) => {
      setToken(t);
      if (t) {
        localStorage.setItem('token', t);
        fetchProfile(t);
        getUserCart(t);
      } else {
        localStorage.removeItem('token');
        setProfile(null);
      }
    },
    token,
    profile,
    setProfile,
    fetchProfile,
    logoutAll,
  };
  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};
export default ShopContextProvider;
