/* eslint-disable @next/next/no-img-element */

interface ImageProps {
  src: { src: string } | string;
  alt: string;
}

export default function Image({ src, alt }: ImageProps) {
  const imgSrc = typeof src === "string" ? src : src.src;
  return <img src={imgSrc} alt={alt} />;
}
