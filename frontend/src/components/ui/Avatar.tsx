interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  className?: string;
  fallbackClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  className,
  fallbackClassName,
}) => (
  <div
    className={`relative flex shrink-0 overflow-hidden rounded-full h-10 w-10 ${
      className || ""
    }`}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
    ) : (
      <div
        className={`flex items-center justify-center h-full w-full bg-gray-200 text-sm font-semibold text-gray-700 ${
          fallbackClassName || ""
        }`}
      >
        {fallback.charAt(0)}
      </div>
    )}
  </div>
);

export default Avatar;