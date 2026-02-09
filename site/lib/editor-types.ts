export interface EditEntry {
  /** Identifier for the edit location, e.g. "section:problem.p:0" */
  path: string;
  /** Original text as rendered in the DOM (Unicode) */
  oldText: string;
  /** New text after editing (Unicode) */
  newText: string;
}

export const SLUG_TO_FILE: Record<string, string> = {
  "fb-ordering": "app/work/fb-ordering/FBOrderingContent.tsx",
  "compendium": "app/work/compendium/CompendiumContent.tsx",
  "upsells": "app/work/upsells/UpsellsContent.tsx",
  "checkin": "app/work/checkin/CheckinContent.tsx",
  "general-task": "app/work/general-task/GeneralTaskContent.tsx",
  "design-system": "app/work/design-system/DesignSystemContent.tsx",
};

export const EDITOR_SERVER_URL = "http://localhost:3002";
