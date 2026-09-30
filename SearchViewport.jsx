import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function readSearchViewport(win) {
  const viewport = win.visualViewport;
  return {
    top: viewport ? viewport.offsetTop : 0,
    height: viewport ? viewport.height : win.innerHeight,
    keyboardOpen: Boolean(viewport && win.innerHeight - viewport.height > 120),
  };
}

// Keep the input inside the visible area when Safari opens its keyboard.
// A portal also avoids the app's transforms changing fixed positioning.
export default function SearchViewport({ children, onClose }) {
  const [viewport, setViewport] = useState(() => readSearchViewport(window));
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sync = () => setViewport(readSearchViewport(window));
    const visible = window.visualViewport;
    visible?.addEventListener("resize", sync);
    visible?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    sync();
    return () => {
      document.body.style.overflow = previousOverflow;
      visible?.removeEventListener("resize", sync);
      visible?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  function handleKeys(event) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); }
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll("button:not(:disabled),input:not(:disabled),[tabindex='0']")];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Search Phantom" className="iphone-search-sheet"
      onKeyDown={handleKeys}
      style={{ position: "fixed", zIndex: 100, top: viewport.top, left: 0, right: 0,
        height: viewport.height, background: "#000", color: "#fff", overflow: "hidden",
        fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
        "--search-bottom-inset": viewport.keyboardOpen ? "8px" : "max(12px, env(safe-area-inset-bottom))" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", maxWidth: 393, margin: "0 auto" }}>
        {children}
      </div>
    </div>, document.body);
}
