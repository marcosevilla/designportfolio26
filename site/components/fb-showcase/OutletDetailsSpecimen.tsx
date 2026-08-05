"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ELEV, neutral, primary, RADIUS, TYPE, W } from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";
import { CHROME_H, Icon, NAV_W, Sidebar, WindowChrome } from "./admin-shell";
import {
  BASE_DESCRIPTION, DESCRIPTION_MAX, OUTLET,
} from "./outlet-details-data";

/**
 * Canary's outlet-details editor — the F&B CMS screen where staff describe a
 * dining outlet, with a live guest-phone preview mirroring every edit.
 * Recreated from Figma frame `57:8145` (Canary Polished Visuals) at the
 * shared 1177px staff shell. Interactive: all six text fields are controlled
 * inputs mirrored into the preview (title, description, phone render there);
 * the photo dropzone toggles an "uploaded" hero; Publish fires a loading
 * beat + toast. Sidebar, breadcrumb, Translate, Add Hours stay inert.
 *
 * Task 4 of 6: static shell, top bar, and form column only. Preview,
 * photo/toast choreography, and the DemoStage wrap arrive in later tasks —
 * this file exports the bare `Editor` in a plain fixed-size div for now.
 *
 * Deliberate deviations from the frame (Marco's rulings, 2026-08-04):
 * 1. Preview email is dining@thelodgeresort.com — the frame's
 *    dining@savannahsunset.com is a leftover from another property.
 * 2. Geometry adapted from the frame's 1476px canvas to the shared 1177px
 *    shell (form 582→500, preview region compressed; phone stays 370).
 * 3. The "uploaded" photo reuses the cart specimen's info-hero.webp —
 *    no photo exists in the frame ("No image available" is its point).
 * 4. Plain <img>, not next/image — images.unoptimized is on site-wide and
 *    the fixed-geometry shell doesn't want next/image's wrapper.
 * 5. The frame's phone-country flag (blue/white/red vertical bars) is kept
 *    verbatim even though it reads French against a +1 number.
 */

// ─── Geometry (adapted from frame 57:8145 to the 1177 shell) ──────────────

const APP_W = 1177; // matches the other staff specimens
const CONTENT_W = APP_W - NAV_W; // 961
const HEADER_H = 64; // frame: 73, compressed with the shell
const FORM_W = 500; // frame: 582 in a wider canvas
const FORM_X = 24;
const APP_H = 982; // header 64 + form stack 898 + 20 bottom pad
const SHELL_W = APP_W;
const SHELL_H = APP_H + CHROME_H; // 1018

// ─── Primitives ────────────────────────────────────────────────────────────

function EnChip() {
  return (
    <span
      style={{
        ...TYPE.micro,
        fontWeight: W.medium,
        color: neutral[600],
        backgroundColor: neutral[100],
        borderRadius: RADIUS.sm,
        padding: "2px 4px",
      }}
    >
      EN
    </span>
  );
}

function Field({
  label, en, value, onChange, demo,
}: {
  label: string;
  en?: boolean;
  value: string;
  onChange: (v: string) => void;
  demo?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[800] }}>{label}</span>
        {en && <EnChip />}
      </div>
      <input
        type="text"
        value={value}
        data-demo={demo}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 38,
          paddingInline: 13,
          borderRadius: RADIUS.md,
          border: `1px solid ${focused ? primary[500] : neutral[300]}`,
          outline: "none",
          backgroundColor: neutral[0],
          ...TYPE.body,
          color: neutral[900],
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{
        width: 12,
        height: 12,
        borderRadius: RADIUS.full,
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: neutral[0],
        display: "inline-block",
      }}
    />
  );
}

// ─── Editor ─────────────────────────────────────────────────────────────────

function Editor() {
  const [title, setTitle] = useState(OUTLET.title);
  const [type, setType] = useState(OUTLET.type);
  const [description, setDescription] = useState(BASE_DESCRIPTION);
  const [address, setAddress] = useState(OUTLET.address);
  const [website, setWebsite] = useState(OUTLET.website);
  const [phone, setPhone] = useState(OUTLET.phone);
  const [photo, setPhoto] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const publishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [descFocused, setDescFocused] = useState(false);

  const publish = () => {
    if (publishing) return;
    setPublishing(true);
    publishTimer.current = setTimeout(() => {
      setPublishing(false);
      setToast("Changes published");
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2400);
    }, 700);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (publishTimer.current) clearTimeout(publishTimer.current);
    },
    [],
  );

  return (
    <div
      style={{
        width: SHELL_W,
        height: SHELL_H,
        borderRadius: RADIUS.lg,
        overflow: "hidden",
        backgroundColor: neutral[0],
        border: `1px solid ${neutral[200]}`,
        boxShadow: ELEV.lg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <WindowChrome />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Sidebar />

        <div style={{ width: CONTENT_W, display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          <div
            style={{
              height: HEADER_H,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              paddingInline: 24,
              borderBottom: `1px solid ${neutral[100]}`,
            }}
          >
            <span style={{ ...TYPE.body, color: neutral[500] }}>Home</span>
            <span style={{ width: 12, flexShrink: 0 }} />
            <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[900] }}>
              {title}
            </span>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  ...TYPE.body,
                  color: neutral[700],
                  cursor: "default",
                  background: "none",
                  border: "none",
                }}
              >
                Translate
              </span>
              <button
                type="button"
                data-demo="publish"
                onClick={publish}
                style={{
                  height: 36,
                  paddingInline: 16,
                  borderRadius: RADIUS.md,
                  border: "none",
                  backgroundColor: primary[500],
                  color: neutral[0],
                  ...TYPE.body,
                  fontWeight: W.medium,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {publishing && <Spinner />}
                {publishing ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>

          {/* Body row — preview column arrives in Task 5 */}
          <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
            <div
              style={{
                width: FORM_W,
                marginLeft: FORM_X,
                paddingTop: 24,
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              <Field label="Title" en value={title} onChange={setTitle} />
              <Field label="Type" en value={type} onChange={setType} />

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[800] }}>
                    Description
                  </span>
                  <EnChip />
                  <span style={{ ...TYPE.caption, color: neutral[500], marginLeft: "auto" }}>
                    {description.length}/{DESCRIPTION_MAX}
                  </span>
                </div>
                <textarea
                  value={description}
                  data-demo="field-description"
                  maxLength={DESCRIPTION_MAX}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  style={{
                    height: 118,
                    padding: 13,
                    borderRadius: RADIUS.md,
                    border: `1px solid ${descFocused ? primary[500] : neutral[300]}`,
                    outline: "none",
                    resize: "none",
                    backgroundColor: neutral[0],
                    ...TYPE.body,
                    color: neutral[900],
                    width: "100%",
                    boxSizing: "border-box",
                    fontFamily: TYPE.body.fontFamily,
                  }}
                />
              </div>

              <Field label="Address" value={address} onChange={setAddress} />
              <Field label="Website" value={website} onChange={setWebsite} />

              {/* Phone */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[800] }}>
                    Phone
                  </span>
                </div>
                <div style={{ display: "flex", height: 38 }}>
                  <div
                    style={{
                      width: 81,
                      flexShrink: 0,
                      border: `1px solid ${neutral[300]}`,
                      borderRight: "none",
                      borderRadius: "8px 0 0 8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ display: "flex", gap: 0 }}>
                      <span style={{ width: 5, height: 12, backgroundColor: "#3b5bdb" }} />
                      <span
                        style={{
                          width: 5,
                          height: 12,
                          backgroundColor: "#fff",
                          border: `1px solid ${neutral[200]}`,
                        }}
                      />
                      <span style={{ width: 5, height: 12, backgroundColor: "#e03131" }} />
                    </span>
                    <span style={{ ...TYPE.body, color: neutral[800] }}>+1</span>
                    <Icon path={ICONS.chevronDown} size={12} color={neutral[500]} />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      height: 38,
                      paddingInline: 13,
                      borderRadius: "0 8px 8px 0",
                      border: `1px solid ${neutral[300]}`,
                      outline: "none",
                      backgroundColor: neutral[0],
                      ...TYPE.body,
                      color: neutral[900],
                      flex: 1,
                      minWidth: 0,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Manage Hours */}
              <div
                style={{
                  height: 68,
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: RADIUS.md,
                  padding: "0 24px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ ...TYPE.body, fontWeight: W.semibold, color: neutral[900] }}>
                  Manage Hours
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    ...TYPE.body,
                    fontWeight: W.medium,
                    color: primary[500],
                    cursor: "default",
                  }}
                >
                  Add Hours
                </span>
              </div>

              {/* Photos */}
              <div
                style={{
                  border: `1px solid ${neutral[200]}`,
                  borderRadius: RADIUS.md,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    ...TYPE.body,
                    fontWeight: W.semibold,
                    color: neutral[900],
                    marginBottom: 12,
                  }}
                >
                  Photos
                </div>
                <button
                  type="button"
                  data-demo="dropzone"
                  aria-label="Upload photos"
                  onClick={() => setPhoto((p) => !p)}
                  style={{
                    height: 158,
                    width: "100%",
                    border: `1.5px dashed ${neutral[300]}`,
                    borderRadius: RADIUS.md,
                    backgroundColor: neutral[0],
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 0,
                  }}
                >
                  {/* Task 6 swaps in the uploaded thumbnail when photo === true */}
                  <Icon path={ICONS.imagePlus} size={32} color={neutral[400]} />
                  <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[700] }}>
                    Click to upload photos
                  </span>
                  <span style={{ ...TYPE.caption, color: neutral[500] }}>PNG, JPG up to 5MB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────

export default function OutletDetailsSpecimen() {
  return <Editor />;
}
