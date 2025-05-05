import { useEffect, useState } from "react";

interface AvatarProps {
  src?: string | null | Promise<string>;
  alt?: string;
  fallback: string | Promise<string>;
  className?: string;
  fallbackClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  className,
  fallbackClassName,
}) => {
  const [resolvedFallback, setResolvedFallback] = useState<string>("");
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (src instanceof Promise) {
      src.then(setResolvedSrc).catch(() => setResolvedSrc(""));
    } else {
      setResolvedSrc(src || undefined);
    }
  }, [src]);

  useEffect(() => {
    if (fallback instanceof Promise) {
      fallback.then(setResolvedFallback).catch(() => setResolvedFallback("?"));
    } else {
      setResolvedFallback(fallback);
    }
  }, [fallback]);

  return (
    <div
      className={`relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 ${
        className || ""
      }`}
    >
      {src ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex items-center justify-center h-full w-full bg-gray-200 text-sm font-semibold text-gray-700 ${
            fallbackClassName || ""
          }`}
        >
          {resolvedFallback.charAt(0)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
