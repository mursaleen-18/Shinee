import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="flex item-center py-2 px-[4%] justify-between bg-gradient-to-r from-slate-50 to-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/60 sticky top-0 z-30">
      <img
        className="w-[max(10%,80px)] drop-shadow-sm"
        src={assets.logo}
        alt=""
      />
      <button
        onClick={() => { sessionStorage.removeItem('token'); setToken("") }}
        className="bg-gray-800 hover:bg-gray-900 active:scale-[0.98] text-white px-5 py-2 sm:px-7 rounded-full text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
