import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // 🧠 Make sure both are exported from firebase.js
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Login.css";
import React from "react";

const provider = new GoogleAuthProvider();

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔥 Firestore: Check if user document exists, if not create it
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || user.email || "Unnamed User",
          email: user.email,
          photoURL: user.photoURL || "",
        });
      }

      // ✅ Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in:", user.displayName);
      } else {
        console.log("User is not logged in");
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  // --- Icon Component (remains the same) ---
  const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d={path} />
    </svg>
  );

  const ICONS = {
    LOGO: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z",
    CHAT: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
    LEADERBOARD:
      "M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-8h4v8z",
    LIST: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
  };

  // --- BrandingPanel Component ---
  const BrandingPanel = () => (
    <div className="branding-panel">
      <div>
        <div className="logo-container">
          <div className="logo-icon-wrapper">
            <Icon path={ICONS.LOGO} className="logo-icon" />
          </div>
          <h1 className="app-title">CodeCollab</h1>
        </div>
        <h2 className="tagline">Collaborate, Compete, & Conquer.</h2>
        <p className="subtitle">
          The ultimate platform for teams to sharpen their coding skills
          together.
        </p>
      </div>
      <div className="features-list">
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Icon path={ICONS.CHAT} className="feature-icon" />
          </div>
          <div>
            <h3 className="feature-title">Real-time Chat Rooms</h3>
            <p className="feature-description">
              Discuss strategies and solutions live.
            </p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Icon path={ICONS.LEADERBOARD} className="feature-icon" />
          </div>
          <div>
            <h3 className="feature-title">Competitive Leaderboards</h3>
            <p className="feature-description">
              See who's leading the pack in your team.
            </p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon-wrapper">
            <Icon path={ICONS.LIST} className="feature-icon" />
          </div>
          <div>
            <h3 className="feature-title">Shared Problem Lists</h3>
            <p className="feature-description">
              Tackle challenges together from a shared pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // --- LoginForm Component ---
  const LoginForm = () => (
    <div className="login-form-panel">
      <div className="login-form-container">
        <div className="login-header">
          <h2 className="welcome-title">Welcome to CodeCollab</h2>
          <p className="welcome-subtitle">
            The easiest way to get started is with Google.
          </p>
        </div>

        <button className="google-login-button" onClick={handleGoogleLogin} >
          <svg className="google-icon" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,35.619,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          <span className="google-button-text">Continue with Google</span>
        </button>

        <p className="terms-text">
          By continuing, you agree to the CodeCollab Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </div>
  );

  return (
    <div className="login-page-wrapper">
      <BrandingPanel />
      <LoginForm />
    </div>
  );
}

export default Login;
