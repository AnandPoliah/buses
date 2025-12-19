import React, { useState } from "react"; // Import useState
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./AuthStyles.css";

// Validation Schema
const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data) => {
    const { username, password } = data;
    const result = login(username, password);

    if (result.success) {
      toast.success(`Welcome Back! Logged in as ${username}`);
      navigate(result.userRole === "admin" ? "/admin" : "/");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="username">Username or Phone</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              {...register("username")}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && (
              <p className="error-text">{errors.username.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            {/* Password Wrapper for relative positioning */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"} // Dynamic type
                id="password"
                placeholder="Enter password"
                {...register("password")}
                className={errors.password ? "input-error" : ""}
              />

              {/* Google Material Icon Toggle */}
              <span
                className="material-symbols-outlined password-toggle-icon"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </div>

            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
