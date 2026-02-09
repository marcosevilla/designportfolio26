"use client";

import { createContext, useContext } from "react";

interface CaseStudyDialogContextValue {
  openStudy: (slug: string) => void;
  closeStudy: () => void;
  /** Whether a dialog is currently open */
  isOpen: boolean;
}

const CaseStudyDialogContext = createContext<CaseStudyDialogContextValue>({
  openStudy: () => {},
  closeStudy: () => {},
  isOpen: false,
});

export const CaseStudyDialogProvider = CaseStudyDialogContext.Provider;

export function useCaseStudyDialog() {
  return useContext(CaseStudyDialogContext);
}
