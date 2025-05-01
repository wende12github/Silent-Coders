import {Eye,EyeOff,Mail,Lock} from 'lucide-react';
import { Link } from 'react-router-dom';

import React,{useState} from 'react'

const Login :React.FC = () => {
  const [formData,setFormData]= useState({email:"",password:"",});
  const[errors,setErrors]=useState({email:"",password:""});
  const [showPassword,setShowPassword]=useState(false);


  const validateEmail=(email:string)=>{
    const reg=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!email)
        return "Email is required";
      if(!reg.test(email))
         return "Please enter a vaild email address";
        return "";
  };

  const validatePassword=(password:string)=>{
    if(!password)
       return "Password is required";
       return "";
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
 // Real-time validation
    let error = "";
    switch (name) {
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        // Validate all fields
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
    
        const newErrors = {
          email: emailError,
          password: passwordError,
        };
        setErrors(newErrors);

        // Proceed if no errors
        if (!emailError && !passwordError) {
          console.log("Form submitted:", formData);
          // submit logic here
        }
      };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
      <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
         <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to your account
           </p>      
        </div>

        <div className="mt-8 bg-white py-8 px-6 shadow-md rounded-lg">
           <form className="space-y-6" onSubmit={handleSubmit}>
             <div className="space-y-2">
               <div className="relative ">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-gray-400" />
                 </div>

                 <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    errors.password ? "border-red-500" : "border-gray-300"}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>


<div className="space-y-2 ">
              <div className="relative ">
                 <div className="absolute  inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5  text-gray-400" />
                </div>
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                 
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    errors.password ? "border-red-500" : "border-gray-300"}`}
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
              <button type="submit" className="w-full p-2 rounded-lg border-2 border-blue-500 bg-blue-500 hover:bg-blue-400">
                Login
              </button>
            </div>
        </form>

        <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login





