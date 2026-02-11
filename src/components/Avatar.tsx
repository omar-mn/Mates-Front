import { useState } from 'react';
import { cn, getInitials } from '../utils/helpers';

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  className?: string;
};

const Avatar = ({ src, alt, fallbackText, className }: AvatarProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700',
          className,
        )}
        aria-label={alt}
      >
        {getInitials(fallbackText, 'U')}
      </div>
    );
  }

  return <img src={src} alt={alt} className={cn('h-10 w-10 rounded-full object-cover', className)} onError={() => setFailed(true)} />;
};

export default Avatar;
