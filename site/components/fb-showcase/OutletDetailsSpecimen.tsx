"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import DemoStage, { type DemoStep } from "@/components/DemoStage";
import { ELEV, neutral, primary, RADIUS, TYPE, W } from "./canary-polished-tokens";
import { ICONS } from "./mdi-icons";
import { CHROME_H, Icon, NAV_W, Sidebar, WindowChrome } from "./admin-shell";
import {
  BASE_DESCRIPTION, DESCRIPTION_MAX, FULL_DESCRIPTION, HERO_SRC, OUTLET, PREVIEW,
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
 * The live guest-phone preview mirrors the form keystroke-by-keystroke
 * (title, description, phone); the hero starts in the gray "No image
 * available" state and crossfades to the uploaded photo. Wrapped in the
 * same DemoStage choreography as the three specimens above it.
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
const PHONE_W = 370;
const APP_H = 982; // header 64 + form stack 898 + 20 bottom pad
const SHELL_W = APP_W;
const SHELL_H = APP_H + CHROME_H; // 1018

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

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

function PhonePreview({
  title, description, phone, photo,
}: {
  title: string;
  description: string;
  phone: string;
  photo: boolean;
}) {
  return (
    <div
      style={{
        width: PHONE_W,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: neutral[0],
        boxShadow: ELEV.overlay,
        border: `1px solid ${neutral[100]}`,
      }}
    >
      {/* Hero — crossfades when a photo is "uploaded" (Task 6 wires photo) */}
      <div style={{ position: "relative", height: 180, backgroundColor: neutral[200] }}>
        <AnimatePresence>
          {photo ? (
            <motion.img
              key="hero"
              src={HERO_SRC}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              }}
            />
          ) : (
            <motion.span
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                ...TYPE.body,
                color: neutral[500],
              }}
            >
              {PREVIEW.noImage}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ ...TYPE.title, fontWeight: W.semibold, color: neutral[900], margin: 0 }}>
          {title}
        </h3>

        {/* Order Food CTA */}
        <div
          style={{
            height: 40,
            borderRadius: RADIUS.md,
            backgroundColor: "#131822",
            color: neutral[0],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span style={{ ...TYPE.body, fontWeight: W.medium }}>{PREVIEW.cta}</span>
          <span style={{ position: "absolute", right: 12 }}>
            <Icon path={ICONS.chevronRight} size={16} color={neutral[0]} />
          </span>
        </div>

        <p style={{ ...TYPE.body, color: neutral[700], margin: 0, minHeight: 80 }}>{description}</p>

        {/* Contact rows */}
        <div style={{ border: `1px solid ${neutral[200]}`, borderRadius: RADIUS.md, overflow: "hidden" }}>
          {[
            { icon: ICONS.phone, text: phone },
            { icon: ICONS.email, text: PREVIEW.email },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                height: 45,
                display: "flex",
                alignItems: "center",
                paddingInline: 12,
                gap: 12,
                borderTop: i > 0 ? `1px solid ${neutral[200]}` : "none",
              }}
            >
              <Icon path={row.icon} size={16} color={neutral[600]} />
              <span style={{ ...TYPE.body, color: neutral[800] }}>{row.text}</span>
              <span style={{ marginLeft: "auto" }}>
                <Icon path={ICONS.chevronRight} size={16} color={neutral[400]} />
              </span>
            </div>
          ))}
        </div>

        {/* Language + legal footer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBlock: 8 }}>
          <div
            style={{
              height: 25,
              paddingInline: 9,
              border: `1px solid ${neutral[200]}`,
              borderRadius: RADIUS.sm,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ ...TYPE.caption, color: neutral[700] }}>{PREVIEW.language}</span>
            <Icon path={ICONS.chevronDown} size={12} color={neutral[500]} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ ...TYPE.micro, color: neutral[500] }}>{PREVIEW.legal}</span>
            <span style={{ ...TYPE.micro, color: neutral[400], display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 12,
                  height: 8,
                  borderRadius: RADIUS.full,
                  backgroundColor: neutral[300],
                  display: "inline-block",
                }}
              />
              {PREVIEW.poweredBy}
            </span>
          </div>
        </div>
      </div>
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
  const [phoneFocused, setPhoneFocused] = useState(false);

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
        // No elevation on the outer shell — see OrderDashboardSpecimen.
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

          {/* Body row */}
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
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    style={{
                      height: 38,
                      paddingInline: 13,
                      borderRadius: "0 8px 8px 0",
                      border: `1px solid ${phoneFocused ? primary[500] : neutral[300]}`,
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
                  <AnimatePresence mode="wait" initial={false}>
                    {photo ? (
                      <motion.div
                        key="uploaded"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                      >
                        <img
                          src={HERO_SRC}
                          alt="The Lodge Restaurant dining room"
                          style={{ width: 180, height: 92, objectFit: "cover", borderRadius: RADIUS.md }}
                        />
                        <span style={{ ...TYPE.caption, color: neutral[600] }}>the-lodge-restaurant.jpg</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                      >
                        <Icon path={ICONS.imagePlus} size={32} color={neutral[400]} />
                        <span style={{ ...TYPE.body, fontWeight: W.medium, color: neutral[700] }}>
                          Click to upload photos
                        </span>
                        <span style={{ ...TYPE.caption, color: neutral[500] }}>PNG, JPG up to 5MB</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhonePreview title={title} description={description} phone={phone} photo={photo} />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                x: "-50%",
                backgroundColor: neutral[800],
                color: neutral[0],
                ...TYPE.body,
                paddingInline: 16,
                height: 36,
                display: "flex",
                alignItems: "center",
                borderRadius: RADIUS.md,
                boxShadow: ELEV.lg,
              }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Choreography ──────────────────────────────────────────────────────────

/**
 * ~15s loop: extend the description (preview mirrors keystroke-by-keystroke,
 * counter walks 137→186/500) → "upload" a photo (dropzone thumbnail + hero
 * crossfade) → Publish (700ms beat, toast). `after` pads cover the crossfade
 * (450ms), the publish beat (700ms), and toast dwell (2.4s).
 */
const OUTLET_DEMO_SCRIPT: DemoStep[] = [
  { type: "wait", ms: 800 },
  { type: "tap", target: "field-description", after: 350 },
  { type: "type", target: "field-description", text: FULL_DESCRIPTION, charMs: 70, after: 1500 },
  { type: "tap", target: "dropzone", after: 1900 },
  { type: "tap", target: "publish", after: 1200 },
  { type: "wait", ms: 2600 },
];

export default function OutletDetailsSpecimen() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoStage
        ariaLabel="Demonstration of the staff outlet-details editor with live guest preview"
        script={OUTLET_DEMO_SCRIPT}
        stageWidth={SHELL_W}
        stageHeight={SHELL_H}
      >
        <Editor />
      </DemoStage>
    </MotionConfig>
  );
}
