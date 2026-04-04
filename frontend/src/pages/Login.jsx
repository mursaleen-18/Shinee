import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { ClerkLoaded, ClerkLoading, SignIn, SignUp, useAuth } from "@clerk/clerk-react";

const Login = () => {
  const { navigate } = useContext(ShopContext);
  const { isSignedIn } = useAuth();
  const [mode, setMode] = useState("signin");

  useEffect(() => {
    if (isSignedIn) navigate("/");
  }, [isSignedIn]);

  return (
    <div className="min-h-[70vh] grid place-items-center py-8">
      <div className="w-full max-w-md">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`px-4 py-2 rounded border ${mode === "signin" ? "bg-black text-white" : ""}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`px-4 py-2 rounded border ${mode === "signup" ? "bg-black text-white" : ""}`}
          >
            Sign Up
          </button>
        </div>
        <ClerkLoading>
          <div className="rounded border px-4 py-6 text-sm text-gray-600">
            Loading authentication...
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          {mode === "signin" ? (
            <SignIn key="signin" />
          ) : (
            <SignUp key="signup" />
          )}
        </ClerkLoaded>
      </div>
    </div>
  );
};

export default Login;
