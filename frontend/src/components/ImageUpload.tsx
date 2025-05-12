import { useState, useEffect } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
}

export const ImageUpload = ({ value, onChange }: ImageUploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === "string" && value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        onChange(null);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", {
          description: "Please upload an image file",
        });
        onChange(null);
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File too large", {
          description: `Image size should be less than ${
            maxSize / (1024 * 1024)
          }MB`,
        });
        onChange(null);
        return;
      }

      setIsLoading(true);

      onChange(file);
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Failed to process image. Please try again.",
      });
      onChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  return (
    <div className="relative w-24 h-24">
      <label
        htmlFor="imageUpload"
        className={`
          flex items-center justify-center w-24 h-24 rounded-full overflow-hidden
          border-2 border-dashed cursor-pointer transition-all duration-200
          ${
            previewUrl
              ? "border-transparent"
              : "border-border hover:border-muted-foreground dark:border-border-dark dark:hover:border-muted-foreground-dark"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center
                       text-muted-foreground dark:text-muted-foreground-dark"
          >
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

      {previewUrl && (
        <button
          type="button"
          onClick={handleRemoveImage}
          className="absolute cursor-pointer -top-2 -right-2 rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-sm transition-colors
                     bg-destructive text-destructive-foreground hover:bg-destructive/90
                     dark:bg-destructive-dark dark:text-destructive-foreground-dark dark:hover:bg-destructive-dark/90"
          disabled={isLoading}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove image</span>
        </button>
      )}
    </div>
  );
};
