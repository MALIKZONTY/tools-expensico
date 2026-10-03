"use client";

import { useEffect, useRef, type ImgHTMLAttributes } from "react";

/**
 * <img> for a Blob. The object URL is created and revoked inside the same effect, so it is
 * safe under React Strict Mode (which runs effect cleanup once on mount): creating the URL in
 * useMemo and revoking it in an effect cleanup leaves the image pointing at a revoked URL.
 */
export function BlobImage({ blob, alt, ...props }: { blob: Blob; alt: string } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    if (ref.current) ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  // eslint-disable-next-line @next/next/no-img-element -- local blob previews; next/image can't optimise them
  return <img ref={ref} alt={alt} {...props} />;
}
