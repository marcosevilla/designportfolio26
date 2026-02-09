"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInlineEditor } from "@/lib/InlineEditorContext";

/**
 * EditableOverlay — scans the DOM for editable text elements on case study pages.
 * When edit mode is active:
 * - Adds hover outlines to editable text (p, h2, h3, h4, li, stats, hero)
 * - Makes them contentEditable on click
 * - Records changes to the InlineEditorContext on blur
 */

const EDITABLE_SELECTOR = [
  "article p",
  "article h2",
  "article h3",
  "article h4",
  "article li > span", // list items with span wrappers
  "article li",        // direct list items
  "[data-editable-stat-value]",
  "[data-editable-stat-label]",
  "[data-editable='hero-title']",
  "[data-editable='hero-subtitle']",
].join(", ");

// Elements to skip (non-content)
const SKIP_CLASSES = ["text-[13px]"]; // ImagePlaceholder description text

// Single-line elements that finish editing on Enter
const SINGLE_LINE_TAGS = new Set(["h1", "h2", "h3", "h4", "span"]);

export default function EditableOverlay() {
  const { editMode, addEdit } = useInlineEditor();
  const activeElementRef = useRef<HTMLElement | null>(null);
  const originalTextRef = useRef<string>("");

  // Generate a path identifier for an element based on its position
  const getElementPath = useCallback((el: HTMLElement): string => {
    // Check for data-editable attributes first (stats + hero)
    if (el.hasAttribute("data-editable-stat-value")) {
      return `stats:${el.getAttribute("data-editable-stat-value")}.value`;
    }
    if (el.hasAttribute("data-editable-stat-label")) {
      return `stats:${el.getAttribute("data-editable-stat-label")}.label`;
    }
    const editableAttr = el.getAttribute("data-editable");
    if (editableAttr === "hero-title") return "hero.title";
    if (editableAttr === "hero-subtitle") return "hero.subtitle";

    // Find the nearest section anchor
    const article = el.closest("article");
    if (!article) return `unknown.${el.tagName}`;

    // Walk up to find the nearest section ID
    let sectionId = "root";
    let current: HTMLElement | null = el;
    while (current && current !== article) {
      // Check for id attribute that matches a section
      const id = current.getAttribute("id");
      if (id && current.tagName === "DIV" && current.classList.contains("scroll-mt-24")) {
        sectionId = id;
        break;
      }
      // Check for ExpandableSection id
      const prevSibling = current.previousElementSibling;
      if (prevSibling?.getAttribute("id")) {
        sectionId = prevSibling.getAttribute("id") || sectionId;
        break;
      }
      current = current.parentElement;
    }

    // Count element index within section context
    const tag = el.tagName.toLowerCase();
    const section = sectionId !== "root"
      ? document.getElementById(sectionId)?.parentElement ?? article
      : article;

    const siblings = section.querySelectorAll(`:scope ${tag}`);
    let index = 0;
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i] === el) { index = i; break; }
    }

    return `section:${sectionId}.${tag}:${index}`;
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.matches(EDITABLE_SELECTOR)) return;

    // Skip non-content elements
    if (SKIP_CLASSES.some((cls) => target.classList.contains(cls))) return;

    // Skip if already editing this element
    if (activeElementRef.current === target) return;

    // Finish editing previous element
    if (activeElementRef.current) {
      finishEditing(activeElementRef.current);
    }

    // Start editing
    activeElementRef.current = target;
    originalTextRef.current = target.textContent || "";
    target.contentEditable = "true";
    target.style.outline = "2px solid var(--color-accent)";
    target.style.outlineOffset = "2px";
    target.style.borderRadius = "2px";
    target.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  const finishEditing = useCallback((el: HTMLElement) => {
    const newText = el.textContent || "";
    const oldText = originalTextRef.current;

    el.contentEditable = "false";
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.borderRadius = "";

    if (newText !== oldText && newText.trim() !== "") {
      const path = getElementPath(el);
      addEdit(path, oldText, newText);
    }

    activeElementRef.current = null;
    originalTextRef.current = "";
  }, [addEdit, getElementPath]);

  const handleBlur = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target === activeElementRef.current) {
      finishEditing(target);
    }
  }, [finishEditing]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeElementRef.current) return;

    // Enter finishes editing for single-line elements
    if (e.key === "Enter" && !e.shiftKey) {
      const tag = activeElementRef.current.tagName.toLowerCase();
      if (SINGLE_LINE_TAGS.has(tag)) {
        e.preventDefault();
        activeElementRef.current.blur();
      }
    }

    // Escape reverts and exits
    if (e.key === "Escape") {
      activeElementRef.current.textContent = originalTextRef.current;
      activeElementRef.current.blur();
    }
  }, []);

  // Add hover styles in edit mode
  useEffect(() => {
    if (!editMode) return;

    const style = document.createElement("style");
    style.id = "editor-hover-styles";
    style.textContent = `
      article p:hover,
      article h2:hover,
      article h3:hover,
      article h4:hover,
      article li:hover,
      [data-editable-stat-value]:hover,
      [data-editable-stat-label]:hover,
      [data-editable="hero-title"]:hover,
      [data-editable="hero-subtitle"]:hover {
        outline: 1px dashed var(--color-accent) !important;
        outline-offset: 2px !important;
        cursor: text !important;
      }
      [contenteditable="true"] {
        outline: 2px solid var(--color-accent) !important;
        outline-offset: 2px !important;
        cursor: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [editMode]);

  // Attach/detach event listeners
  useEffect(() => {
    if (!editMode) {
      // Clean up any active editing when leaving edit mode
      if (activeElementRef.current) {
        activeElementRef.current.contentEditable = "false";
        activeElementRef.current.style.outline = "";
        activeElementRef.current = null;
      }
      return;
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("blur", handleBlur, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("blur", handleBlur, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editMode, handleClick, handleBlur, handleKeyDown]);

  // No DOM output — this component only adds behavior
  return null;
}
