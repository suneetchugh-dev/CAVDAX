import React, { useState, useEffect } from 'react';

/**
 * ShimmerImage — High-performance image loader with smooth shimmer skeleton transition.
 * 
 * Complies with CAVDAX Design Standards:
 * - Fluid horizontal shimmer sweep animation before image decode.
 * - Smooth CSS opacity transition (300ms ease-out) once loaded to eliminate abrupt pop-in.
 * - Handles src changes, image errors, and responsive container framing.
 */
export default function ShimmerImage({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  onError,
  loading = 'lazy',
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset loaded status if image source changes (e.g. in lightbox)
  useEffect(() => {
    setLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmer skeleton layer visible until image is fully decoded */}
      {!loaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 shimmer-active"
        />
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setHasError(true);
          if (onError) onError(e);
        }}
        className={`${className} transition-opacity duration-300 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
}
