import React from 'react';
import CavdaxBrandLoader from './CavdaxBrandLoader';

/**
 * CavdaxLogoLoader Component
 * Backward-compatible wrapper mapping to the canonical EXP-1 Brand Looping Loader.
 */
export default function CavdaxLogoLoader(props) {
  return <CavdaxBrandLoader {...props} />;
}

export { CavdaxBrandLoader };
