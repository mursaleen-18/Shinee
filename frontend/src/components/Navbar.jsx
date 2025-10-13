import React, { useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const location = useLocation();
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  return (
    <div>
      <div className="flex items-center justify-between py-5 font-medium sticky top-0 z-40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
        <div className="logo w-40 ">
          <Link to="/">
            <img
              className="transition-transform duration-200 hover:scale-[1.02]"
              src={assets.logo}
              alt="Logo"
            />
          </Link>
        </div>
        <ul className="hidden sm:flex gap-6 text-sm text-gray-700 ">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative group flex flex-col items-center gap-1 ${
                isActive ? "text-black" : ""
              }`
            }
          >
            <p
              className={`transition-colors group-hover:text-black ${
                location.pathname === "/" ? "text-black font-semibold" : ""
              }`}
            >
              HOME
            </p>
            <hr
              className={`border-none h-[1.5px] bg-gray-900 transition-all duration-200 ${
                location.pathname === "/" ? "w-2/4" : "w-0 group-hover:w-2/4"
              }`}
            />
          </NavLink>
          <NavLink
            to="/collection"
            className={({ isActive }) =>
              `relative group flex flex-col items-center gap-1 ${
                isActive ? "text-black" : ""
              }`
            }
          >
            <p
              className={`transition-colors group-hover:text-black ${
                location.pathname.startsWith("/collection")
                  ? "text-black font-semibold"
                  : ""
              }`}
            >
              COLLECTIONS
            </p>
            <hr
              className={`border-none h-[1.5px] bg-gray-900 transition-all duration-200 ${
                location.pathname.startsWith("/collection")
                  ? "w-2/4"
                  : "w-0 group-hover:w-2/4"
              }`}
            />
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `relative group flex flex-col items-center gap-1 ${
                isActive ? "text-black" : ""
              }`
            }
          >
            <p
              className={`transition-colors group-hover:text-black ${
                location.pathname.startsWith("/about")
                  ? "text-black font-semibold"
                  : ""
              }`}
            >
              ABOUT
            </p>
            <hr
              className={`border-none h-[1.5px] bg-gray-900 transition-all duration-200 ${
                location.pathname.startsWith("/about")
                  ? "w-2/4"
                  : "w-0 group-hover:w-2/4"
              }`}
            />
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `relative group flex flex-col items-center gap-1 ${
                isActive ? "text-black" : ""
              }`
            }
          >
            <p
              className={`transition-colors group-hover:text-black ${
                location.pathname.startsWith("/contact")
                  ? "text-black font-semibold"
                  : ""
              }`}
            >
              CONTACT
            </p>
            <hr
              className={`border-none h-[1.5px] bg-gray-900 transition-all duration-200 ${
                location.pathname.startsWith("/contact")
                  ? "w-2/4"
                  : "w-0 group-hover:w-2/4"
              }`}
            />
          </NavLink>
        </ul>
        <div className="flex items-center gap-6">
          {location.pathname.startsWith("/collection") && (
            <img
              onClick={() => setShowSearch(true)}
              src={assets.search_icon}
              className="w-6 cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95 hover:drop-shadow"
              alt="search"
            />
          )}
          <div className="relative inline-block">
            <img
              onClick={() => (token ? null : navigate("/login"))}
              className="w-5 cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95"
              src={assets.profile_icon}
              alt="profile"
              onMouseEnter={() => {
                if (closeTimer.current) {
                  clearTimeout(closeTimer.current);
                }
                if (openTimer.current) {
                  clearTimeout(openTimer.current);
                }
                openTimer.current = setTimeout(
                  () => setIsProfileOpen(true),
                  120
                );
              }}
              onMouseLeave={() => {
                if (openTimer.current) {
                  clearTimeout(openTimer.current);
                }
                closeTimer.current = setTimeout(
                  () => setIsProfileOpen(false),
                  150
                );
              }}
            />

            {isProfileOpen && (
              <div
                className={`absolute right-0 pt-4 z-30 ${
                  isProfileOpen ? "" : "pointer-events-none"
                }`}
                onMouseEnter={() => {
                  if (closeTimer.current) {
                    clearTimeout(closeTimer.current);
                  }
                  setIsProfileOpen(true);
                }}
                onMouseLeave={() => {
                  closeTimer.current = setTimeout(
                    () => setIsProfileOpen(false),
                    150
                  );
                }}
              >
                <div
                  className={`flex flex-col gap-2 w-36 py-3 px-5 bg-white/90 backdrop-blur rounded shadow-lg transition-all duration-150 ${
                    isProfileOpen
                      ? "opacity-100 pointer-events-auto translate-y-0"
                      : "opacity-0 pointer-events-none -translate-y-1"
                  }`}
                >
                  {token ? (
                    <>
                      <p onClick={() => navigate('/profile')} className="cursor-pointer hover:text-gray-500 transition-colors">
                        My Profile
                      </p>
                      <p
                        onClick={() => navigate("/orders")}
                        className="cursor-pointer hover:text-gray-500 transition-colors"
                      >
                        Orders
                      </p>
                      <p
                        onClick={logout}
                        className="cursor-pointer hover:text-gray-500 transition-colors"
                      >
                        Logout
                      </p>
                    </>
                  ) : (
                    <p
                      onClick={() => navigate('/login')}
                      className="cursor-pointer hover:text-gray-500 transition-colors"
                    >
                      Login
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          <Link to="/cart" className="relative group">
            <img
              src={assets.cart_icon}
              className="w-5 min-w-5 transition-transform duration-150 hover:scale-110 active:scale-95"
              alt="cart"
            />
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px] group-hover:bg-blue-600 transition-colors">
              {getCartCount()}
            </p>
          </Link>
          <img
            onClick={() => setVisible((v) => !v)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer sm:hidden transition-transform duration-150 hover:scale-110 active:scale-95"
            alt=""
          />
        </div>
      </div>

      {/*  Sidebar menu for small Screens (Portal)*/}
      {createPortal(
        <div>
          <div
            className={`fixed top-0 right-0 bottom-0 z-[1000] sm:hidden bg-white shadow-lg w-3/4 max-w-xs pointer-events-auto transform transition-transform duration-300 will-change-transform ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col text-gray-800 h-full overflow-y-auto p-4 pb-8">
              <div
                onClick={() => setVisible(false)}
                className="flex items-center gap-4 p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded"
              >
                <img
                  className="h-4 rotate-180"
                  src={assets.dropdown_icon}
                  alt=""
                />
                <p>Back</p>
              </div>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `py-2 pl-6 border ${isActive ? "bg-gray-100 text-black" : ""}`
                }
                to="/"
              >
                HOME
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `py-2 pl-6 border ${isActive ? "bg-gray-100 text-black" : ""}`
                }
                to="/collection"
              >
                COLLECTION
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `py-2 pl-6 border ${isActive ? "bg-gray-100 text-black" : ""}`
                }
                to="/about"
              >
                ABOUT
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `py-2 pl-6 border ${isActive ? "bg-gray-100 text-black" : ""}`
                }
                to="/contact"
              >
                CONTACT
              </NavLink>
            </div>
          </div>
          {visible && (
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[900] bg-black/30 sm:hidden"
              onClick={() => setVisible(false)}
            />
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default Navbar;
