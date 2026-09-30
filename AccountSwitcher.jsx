import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const accountName = (account, index) => account.name || `Account ${index + 1}`;

export default function AccountSwitcher({ accounts, selected, onClose, onSelect, onReceive, onCreate, onRename, onPhoto, icons }) {
  const [view, setView] = useState("list");
  const [editing, setEditing] = useState(selected);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(0);
  const dragStart = useRef(null);
  const dialog = useRef(null);
  const initialFocus = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    initialFocus.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  const go = (next) => { setError(""); setView(next); };
  const run = (action) => { try { action(); } catch (failure) { setError(failure.message || "Couldn't save changes. Please try again."); } };
  const finishDrag = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (drag > 90) onClose();
    setDrag(0);
  };
  function keyDown(event) {
    if (event.key === "Escape") { event.preventDefault(); view === "list" ? onClose() : go("list"); }
    if (event.key !== "Tab") return;
    const nodes = [...dialog.current.querySelectorAll("button:not(:disabled),input")];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  const title = view === "list" ? "Your Accounts" : view === "add" ? "Add Account" : view === "create" ? "Create Account" : view === "rename" ? "Rename Account" : accountName(accounts[editing], editing);

  return createPortal(
    <div className="account-switcher" role="dialog" aria-modal="true" aria-label={title} ref={dialog} onKeyDown={keyDown}>
      <div className="account-switcher-panel" style={{ transform: `translateY(${drag}px)` }}>
        <button ref={initialFocus} type="button" className="account-grabber" aria-label="Close account switcher" onClick={onClose}
          onPointerDown={event => { dragStart.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerMove={event => { if (dragStart.current !== null) setDrag(Math.max(0, event.clientY - dragStart.current)); }}
          onPointerUp={finishDrag} onPointerCancel={() => { dragStart.current = null; setDrag(0); }}><span /></button>
        <header className="account-switcher-header">
          {view !== "list" && <button type="button" className="account-icon-button" aria-label="Back to your accounts" onClick={() => go("list")}>{icons.back(20, "#fff")}</button>}
          <h1>{title}</h1>
          {view === "list" && <button type="button" className="account-icon-button account-add" aria-label="Add account" onClick={() => go("add")}>{icons.plus(20, "#fff")}</button>}
        </header>
        <div className="account-switcher-content" key={view}>
          {view === "list" && accounts.map((account, index) => (
            <div className="account-switcher-row" key={index}>
              <button type="button" className="account-select" aria-label={`Switch to ${accountName(account, index)}`} aria-current={index === selected ? "true" : undefined} onClick={() => run(() => onSelect(index))}>
                <span className="account-number">A{index + 1}{index === selected && <span className="account-selected" aria-label="Selected"><svg viewBox="0 0 16 16" width="12" height="12"><path d="m4 8 2.5 2.5L12 5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}</span>
                <span className="account-row-name">{accountName(account, index)}</span>
              </button>
              <button type="button" className="account-icon-button" aria-label={`Receive with ${accountName(account, index)}`} onClick={() => run(() => onReceive(index))}>{icons.qr(20, "#C9C9CE")}</button>
              <button type="button" className="account-icon-button" aria-label={`Options for ${accountName(account, index)}`} onClick={() => { setEditing(index); go("options"); }}><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg></button>
            </div>
          ))}
          {view === "add" && <button type="button" className="account-action" onClick={() => { setName(`Account ${accounts.length + 1}`); go("create"); }}>
            {icons.plus(22, "#C9C9CE")}<span><strong>Create New Account</strong><small>Add another account on this device</small></span>
          </button>}
          {view === "options" && <>
            <button type="button" className="account-action" onClick={() => { setName(accountName(accounts[editing], editing)); go("rename"); }}>Rename account</button>
            <button type="button" className="account-action" onClick={() => run(() => onPhoto(editing))}>Change profile picture</button>
          </>}
          {(view === "create" || view === "rename") && <form onSubmit={event => {
            event.preventDefault();
            const value = name.trim();
            if (!value) { setError("Enter an account name."); return; }
            run(() => { if (view === "create") onCreate(value); else { onRename(editing, value); go("list"); } });
          }}>
            <label className="account-name-label" htmlFor="account-name">Account name</label>
            <input id="account-name" value={name} maxLength={40} onChange={event => setName(event.target.value)} autoComplete="off" enterKeyHint="done" />
            <button className="account-save" type="submit">{view === "create" ? "Create account" : "Save name"}</button>
          </form>}
          {error && <p className="account-error" role="alert">{error}</p>}
        </div>
      </div>
    </div>, document.body);
}
