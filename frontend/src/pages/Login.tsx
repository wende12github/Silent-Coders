import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import { Input } from "../components/ui/Form";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

// Define Zod schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();

  const { login } = useAuthStore();
  const [loading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const result = loginSchema.safeParse({ ...formData, [name]: value });
    if (!result.success) {
      const fieldError =
        result.error.flatten().fieldErrors[name as keyof LoginFormData];
      setErrors((prev) => ({ ...prev, [name]: fieldError?.[0] || "" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
      });
      return;
    }
    // console.log("Form submitted:", result.data);
    login(formData)
      .then((res) => {
        if (res.access) {
          navigate("/");
          console.log("Login successful");
        }
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
  };

  return (
    <div className="py-10 flex-grow flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 shadow-full rounded-lg pt-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to your account
          </p>
        </div>

        <div className="bg-white py-8 px-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 w-full">
              <Input
                id="email"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className={`${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="relative space-y-2">
              <Input
                id="password"
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup">
                <Button variant="link">Sign Up</Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
