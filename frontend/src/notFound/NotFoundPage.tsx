import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

interface NotFoundPageProps {
  page?: "user" | "page" | "group";
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ page = "user" }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  if (page === "user") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            User Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The user profile you are looking for could not be found, or the
            provided ID is invalid.
          </p>

          <Button onClick={handleGoHome}>Go to Homepage</Button>
        </div>
      </div>
    );
  } else if (page === "group") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Group Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The group you are looking for could not be found, or the provided ID
            is invalid.
          </p>

          <Button onClick={handleGoHome}>Go to Homepage</Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you are looking for could not be found.
          </p>

          <Button onClick={handleGoHome}>Go to Homepage</Button>
        </div>
      </div>
    );
  }
};

export default NotFoundPage;
