import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { z } from "zod";

import Button from "../components/ui/Button";
import { toast } from "sonner";
// import { ImageUpload } from "../components/ImageUpload";
import { Checkbox } from "../components/ui/Checkbox";
import { Input, Textarea } from "../components/ui/Form";
import { useAuthStore } from "../store/authStore";

// Zod schema
const signupSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .nonempty("Username is required"),
    password: z
      .string()
      .min(4, "Password must be at least 4 characters")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string().nonempty("Please confirm your password"),
    agreedToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms & Conditions",
    }),
    bio: z.string().nullable(),
    // profileImage: z.string().min(1, "Profile image is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type SignupFormData = z.infer<typeof signupSchema>;

const SignUp = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    bio: "",
    // profileImage: "",
  });
  const navigate = useNavigate();

  const [loading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();

  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    const updated = { ...formData, [name]: newValue };
    const result = signupSchema.safeParse(updated);

    if (!result.success) {
      const fieldError =
        result.error.flatten().fieldErrors[name as keyof SignupFormData];
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError?.[0] || "",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || "",
        username: fieldErrors.username?.[0] || "",
        password: fieldErrors.password?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
        agreedToTerms: fieldErrors.agreedToTerms?.[0] || "",
        // profileImage: fieldErrors.profileImage?.[0] || "",
      });
      return;
    }
    signup(formData)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        toast.error("Login failed", {
          description: err.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    setErrors({});
    toast("Account Created!", {
      description: "Your account has been created successfully.",
    });
    console.log("Submitted:", result.data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <h1 className="text-center font-bold text-3xl mb-3 tracking-tight">
        Create Your Account
      </h1>
      <p className="text-center text-gray-600 text-sm">
        Join us today and start your journey
      </p>

      <div className="mt-2 px-6 py-8 bg-white shadow-md rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex flex-col items-center"
        >
          {/* <div className="flex justify-center">
            <ImageUpload
              value={formData.profileImage}
              onChange={handleImageChange}
            />
          </div>
          {errors.profileImage && (
            <p className="text-xs text-red-500">{errors.profileImage}</p>
          )} */}

          <div className="w-full space-y-1">
            <Input
              icon={<Mail className="h-5 w-5 text-gray-400" />}
              id="email"
              name="email"
              type="text"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="w-full space-y-1">
            <Input
              icon={<User className="h-5 w-5 text-gray-400" />}
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="relative w-full space-y-1">
            <Input
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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

          <div className="relative w-full space-y-1">
            <Input
              icon={<Lock className="h-5 w-5 text-gray-400" />}
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
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

          <div className="w-full space-y-1">
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio || ""}
              onChange={handleBioChange}
            />
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <Checkbox
              id="agreedToTerms"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
            />
            <label
              htmlFor="agreedToTerms"
              className="text-sm font-medium leading-none"
            >
              I agree to the Terms & Conditions
            </label>
          </div>
          {errors.agreedToTerms && (
            <p className="text-xs text-red-500">{errors.agreedToTerms}</p>
          )}

          <Button type="submit" className="w-89" disabled={loading}>
            {loading ? "Loading..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login">
              <Button variant="link">Login here</Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
