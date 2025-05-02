// import { useState } from "react";
// import { Image as ImageIcon } from "lucide-react";
// import { toast, Toaster } from "sonner";
// interface ImageUploadProps {
//   value: string | null;
//   onChange: (url: string) => void;
// }

// export const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
//   //   const { toast } = useToast();
//   toast.error("Invalid file type", {
//     description: "Please upload an image file",

//   });

//   const [isLoading, setIsLoading] = useState(false);

//   // Function to convert file to base64 string for preview
//   const convertToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const fileReader = new FileReader();
//       fileReader.readAsDataURL(file);

//       fileReader.onload = () => {
//         resolve(fileReader.result as string);
//       };

//       fileReader.onerror = (error) => {
//         reject(error);
//       };
//     });
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     try {
//       const file = e.target.files?.[0];

//       if (!file) return;

//       // Validate file type
//       if (!file.type.includes('image')) {
//         toast.error("Invalid file type", {
//           description: "Please upload an image file",

//         });
//         return;
//       }

//       // Validate file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("File too large", {
//           description: "Image size should be less than 5MB",
//         });
//         return;
//       }

//       setIsLoading(true);

//       // Convert to base64 for preview
//       const base64 = await convertToBase64(file);
//       onChange(base64);

//       // In a real app, you would upload to a server here
//       // const response = await uploadToServer(file);
//       // onChange(response.url);

//     } catch (error) {
//       toast.error("Something went wrong", {
//         description: "Failed to upload image. Please try again.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="relative w-24 h-24">
//       <label
//         htmlFor="imageUpload"
//         className={`
//           flex items-center justify-center w-24 h-24 rounded-full 
//           border-2 border-dashed cursor-pointer transition-all
//           ${value ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'}
//           ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
//         `}
//       >
//         {value ? (
//           <img
//             src={value}
//             alt="Profile"
//             className="w-full h-full rounded-full object-cover"
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center text-gray-500">
//             <ImageIcon size={24} />
//             <span className="text-xs mt-1">Upload</span>
//           </div>
//         )}

//         <input
//           id="imageUpload"
//           type="file"
//           accept="image/*"
//           onChange={handleFileChange}
//           disabled={isLoading}
//           className="hidden"
//         />
//       </label>

//       {value && (
//         <button
//           type="button"
//           onClick={() => onChange("")}
//           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-sm hover:bg-red-600"
//           disabled={isLoading}
//         >
//           ×
//         </button>
//       )}
//     </div>
//   );
// };



import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
}

export const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please upload an image file",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Image size should be less than 5MB",
        });
        return;
      }

      setIsLoading(true);

      const base64 = await convertToBase64(file);
      onChange(base64);
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-24 h-24">
      <label
        htmlFor="imageUpload"
        className={`
          flex items-center justify-center w-24 h-24 rounded-full 
          border-2 border-dashed cursor-pointer transition-all
          ${value ? "border-transparent" : "border-gray-300 hover:border-gray-400"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {value ? (
          <img
            src={value}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <ImageIcon size={24} />
            <span className="text-xs mt-1">Upload</span>
          </div>
        )}

        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />
      </label>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-sm hover:bg-red-600"
          disabled={isLoading}
        >
          ×
        </button>
      )}
    </div>
  );
};
