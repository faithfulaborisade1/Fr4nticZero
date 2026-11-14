import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CREW, type CrewId } from "../../data/crew";

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

interface Props {
  active: { id: CrewId; name: string; role: string };
  onSelect: (id: CrewId) => void;
}

/** Styled crew profile menu (listbox pattern) replacing the native select. */
export function CrewSwitcher({ active, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listId = useId();

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Move focus to the highlighted option while open.
  useEffect(() => {
    if (open) optionRefs.current[focus]?.focus();
  }, [open, focus]);

  function openMenu() {
    setFocus(Math.max(0, CREW.findIndex((p) => p.id === active.id)));
    setOpen(true);
  }

  function choose(id: CrewId) {
    onSelect(id);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onButtonKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openMenu();
    }
  }

  function onListKey(e: KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Tab") {
      if (e.key === "Escape") e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocus((f) => (f + 1) % CREW.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocus((f) => (f - 1 + CREW.length) % CREW.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocus(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocus(CREW.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(CREW[focus].id);
    }
  }

  return (
    <div className="dw-crew-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="dw-crew-switch"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Viewing ${active.name}, ${active.role}. Switch crew profile`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onButtonKey}
      >
        <span className="dw-avatar" aria-hidden="true">
          {initials(active.name)}
        </span>
        <span className="dw-crew-text">
          <strong>{active.name}</strong>
          <small>{active.role}</small>
        </span>
        <ChevronDown size={14} aria-hidden="true" className="dw-crew-chevron" />
      </button>

      {open && (
        <div className="dw-crew-pop">
          <div className="dw-crew-pop-head">Switch crew profile · simulated</div>
          <ul id={listId} role="listbox" aria-label="Crew profiles" onKeyDown={onListKey}>
            {CREW.map((p, i) => {
              const selected = p.id === active.id;
              return (
                <li
                  key={p.id}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  role="option"
                  aria-selected={selected}
                  tabIndex={focus === i ? 0 : -1}
                  className={`dw-crew-option ${focus === i ? "is-focused" : ""}`}
                  onClick={() => choose(p.id)}
                  onMouseEnter={() => setFocus(i)}
                >
                  <span className="dw-avatar dw-avatar-sm" aria-hidden="true">
                    {initials(p.name)}
                  </span>
                  <span className="dw-crew-text">
                    <strong>{p.name}</strong>
                    <small>{p.role}</small>
                  </span>
                  {selected && <Check size={16} aria-hidden="true" className="dw-crew-check" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
