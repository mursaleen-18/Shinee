import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Order from "./pages/Order";
import Login from "./components/Login";
import { ToastContainer } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const currency = "$";

const App = () => {
  // Read token from sessionStorage and validate expiry if present (admin tokens have exp)
  const readSessionToken = () => {
    const t = sessionStorage.getItem("token") || "";
    if (!t) return "";
    try {
      const payload = JSON.parse(atob(t.split(".")[1] || ""));
      if (payload && payload.exp && Date.now() / 1000 > payload.exp) {
        sessionStorage.removeItem("token");
        return "";
      }
    } catch (_) {
      // if decode fails, treat as no token
      return "";
    }
    return t;
  };

  const [token, setToken] = useState(readSessionToken());
  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
    }
  }, [token]);

  const location = useLocation();

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {token === "" ? (
        <motion.div
          key="admin-login"
          initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Login setToken={setToken} />
        </motion.div>
      ) : (
        <>
          <Navbar setToken={setToken}></Navbar>
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <Routes location={location}>
                    <Route path="/add" element={<Add token={token} />} />
                    <Route path="/list" element={<List token={token} />} />
                    <Route path="/orders" element={<Order token={token} />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
