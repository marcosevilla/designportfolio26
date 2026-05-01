"use client";

import { createContext, useContext } from "react";

/**
 * `true` once the page has scrolled past the in-flow LED matrix, signalling
 * that the floating sticky variant of the HeroToolbar should appear.
 *
 * HomeLayout owns the IntersectionObserver on a sentinel placed directly
 * below the matrix and provides the value here. Default `false` for
 * consumers (e.g. tests / non-home routes) without a provider.
 */
export const StickyToolbarContext = createContext<boolean>(false);

export function useStickyToolbarActive(): boolean {
  return useContext(StickyToolbarContext);
}
