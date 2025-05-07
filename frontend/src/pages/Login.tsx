import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import { Input } from "../components/ui/Form";
import { toast } from "sonner";
import { useLogin } from "../hooks/hooks";
import { useAuthStore } from "../store/authStore";

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
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const { login } = useLogin();
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
      setIsLoading(false);
      return;
    }

    login(formData)
      .then((res) => {
        if (res.access) {
          navigate("/");
          console.log("Login successful");
        }
      })
      .catch((err) => {
        console.error("Login failed:", err);
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
    <div
      className="py-10 flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8
                   bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark"
    >
      <div
        className="w-full max-w-md space-y-8 shadow-full rounded-lg pt-10
                     bg-card text-card-foreground border border-border
                     dark:bg-card-dark dark:text-card-foreground-dark dark:border-border-dark"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground-dark">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground-dark">
            Sign in to continue to your account
          </p>
        </div>

        <div className="py-8 px-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 w-full">
              <Input
                id="email"
                icon={
                  <Mail className="h-5 w-5 text-muted-foreground dark:text-muted-foreground-dark" />
                }
                name="email"
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className={`${
                  errors.email
                    ? "border-destructive dark:border-destructive-dark"
                    : ""
                }`}
              />
              {errors.email && (
                <p className="text-xs text-destructive dark:text-destructive-dark">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative space-y-2">
              <Input
                id="password"
                icon={
                  <Lock className="h-5 w-5 text-muted-foreground dark:text-muted-foreground-dark" />
                }
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring
                           border border-input bg-background text-foreground focus:border-ring
                           dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:focus:ring-ring-dark dark:focus:border-ring-dark
                           ${
                             errors.password
                               ? "border-destructive dark:border-destructive-dark"
                               : ""
                           }`}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-muted-foreground dark:text-muted-foreground-dark"
                onClick={() => setShowPassword(!showPassword)}
                style={{ top: "0", bottom: "0", margin: "auto 0" }}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </div>
              {errors.password && (
                <p className="text-xs text-destructive dark:text-destructive-dark">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary/80 dark:text-primary-dark dark:hover:text-primary-dark/80"
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
            <p className="text-muted-foreground dark:text-muted-foreground-dark">
              Don't have an account?{" "}
              <Link to="/signup">
                <Button
                  variant="link"
                  className="inline-block align-baseline text-primary hover:text-primary/80 dark:text-primary-dark dark:hover:text-primary-dark/80"
                >
                  Sign Up
                </Button>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
