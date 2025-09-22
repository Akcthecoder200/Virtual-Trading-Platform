import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  TrendingUp,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const passwordRequirements = [
    { label: "At least 8 characters", test: (pwd) => pwd && pwd.length >= 8 },
    {
      label: "Contains uppercase letter",
      test: (pwd) => pwd && /[A-Z]/.test(pwd),
    },
    {
      label: "Contains lowercase letter",
      test: (pwd) => pwd && /[a-z]/.test(pwd),
    },
    { label: "Contains number", test: (pwd) => pwd && /\d/.test(pwd) },
  ];

  const onSubmit = async (data) => {
    try {
      await signup({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success("Account created successfully! Welcome to VirtualTrade!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center mb-6">
            <TrendingUp className="w-10 h-10 text-blue-500" />
            <span className="ml-2 text-2xl font-bold text-white">
              VirtualTrade
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">
            Create your account
          </h2>
          <p className="text-gray-400">
            Start your virtual trading journey today
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-gray-800 py-8 px-6 shadow-xl rounded-lg border border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  First Name
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "First name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  autoComplete="given-name"
                  className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Last Name
                </label>
                <input
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Last name must be at least 2 characters",
                    },
                  })}
                  type="text"
                  autoComplete="family-name"
                  className="block w-full px-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Username can only contain letters, numbers, and underscores",
                    },
                  })}
                  type="text"
                  autoComplete="username"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: {
                      hasUppercase: (value) =>
                        /[A-Z]/.test(value) ||
                        "Password must contain an uppercase letter",
                      hasLowercase: (value) =>
                        /[a-z]/.test(value) ||
                        "Password must contain a lowercase letter",
                      hasNumber: (value) =>
                        /\d/.test(value) || "Password must contain a number",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle
                        className={`w-4 h-4 mr-2 ${
                          req.test(password)
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={
                          req.test(password)
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                {...register("acceptTerms", {
                  required: "You must accept the terms and conditions",
                })}
                type="checkbox"
                className="h-4 w-4 mt-1 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label className="ml-2 block text-sm text-gray-300">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-500 hover:text-blue-400">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-blue-500 hover:text-blue-400"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-500">
                {errors.acceptTerms.message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            By creating an account, you agree to receive marketing emails. You
            can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
