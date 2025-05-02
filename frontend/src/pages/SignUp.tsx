import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
// import { formatDate } from 'date-fns';
import Button from "../components/ui/Button";
import { toast } from "sonner";
import { ImageUpload } from "../components/ImageUpload";
import { Checkbox } from "../components/ui/Checkbox";
import { Input } from "../components/ui/Form";
const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!reg.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validateUsername = (username: string) => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    return "";
  };

  function validatePassword(password: string) {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must include lowercase letters";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must include uppercase letters";
    if (!/(?=.*[0-9])/.test(password)) return "Password must include numbers";
    return "";
  }

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string
  ) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "passwords doesn't match";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let error = "";
    switch (name) {
      case "email":
        error = validateEmail(value);
        break;
      case "username":
        error = validateUsername(value);
        break;
      case "password":
        error = validatePassword(value);
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(
            formData.confirmPassword,
            value
          );
          setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailError = validateEmail(formData.email);
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    const termsError = !agreedToTerms
      ? "You must agree to the term and conditions"
      : "";

    const newErrors = {
      email: emailError,
      username: usernameError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      terms: termsError,
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    if (!profileImage) {
      toast.error("Profile Picture Required", {
        description: "Please upload a profile picture",
      });
      return;
    }

    toast("Account Created!", {
      description: "Your account has been created successfully.",
    });
    console.log("Form submitted: ", { ...formData, profileImage });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center  px-4 sm:px-6 lg:px-8">
      <h1 className="text-center font-bold text-3xl mb-3 tracking-tight">
        Create Your account
      </h1>
      <p className="text-center text-gray-600 text-sm">
        Join us today and start your journey
      </p>
      <div className=" mt-2 px-6 py-8 bg-white shadow-md rounded-lg">
        <form
          onSubmit={handleSubmit}
          className=" space-y-6 flex flex-col items-center"
        >
          <div className="flex justify-center">
            <ImageUpload
              value={profileImage}
              onChange={(url: string) => setProfileImage(url)}
            />
          </div>
          {/* Email */}
          <div className="relative w-full">
            <Input
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              id="email"
              name="email"
              type="email"
              value={formData.email}
              placeholder="Email Address"
              onChange={handleChange}
              className={`${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          {/* // Username */}
          <div className="relative w-full">
            <Input
              icon={<User className="h-5 w-5 text-gray-400" />}
              id="username"
              name="username"
              type="text"
              value={formData.username}
              placeholder="User Name"
              onChange={handleChange}
              className={`${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          {/* Password */}
          <div className="relative w-full">
            <Input
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* confirm password */}
          <div className="relative w-full">
            <Input
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              placeholder="Confirm Password"
              onChange={handleChange}
              className={`${
                errors.confirmPassword ? "border-red-400" : ""
              }`}
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const checked = e.target.checked;
                setAgreedToTerms(checked === true);
                setErrors((prev) => ({
                  ...prev,
                  terms:
                    checked === true
                      ? ""
                      : "You must agree to the Terms & Conditions",
                }));
              }}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the Terms & Conditions
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-500">{errors.terms}</p>
          )}

          <Button type="submit" className="w-89">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/Login">
              <Button variant="link">Login here</Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
