import { describe, expect, it } from "vitest";
import { createEntry, linkState } from "./ledger";
import { generateHistory } from "../data/generator";
import { getScenario } from "../data/scenarios";
import { makeEnvironment } from "../engine/environments";
import { buildCards } from "./cards";
import { canPreview, extension, formatSize, MAX_ATTACHMENTS, MAX_BYTES, validateImage, type Attachment } from "./attachments";

describe("validateImage", () => {
  const ok = { name: "scan.jpg", size: 2_000_000 };

  it("accepts the formats on the team's list", () => {
    for (const name of ["a.jpg", "a.jpeg", "a.PNG", "a.webp", "a.raw", "a.dng", "a.cr2"]) {
      expect(validateImage({ name, size: 1000 }, 0)).toBeNull();
    }
  });

  it("rejects other file types", () => {
    expect(validateImage({ name: "notes.pdf", size: 1000 }, 0)).toMatch(/JPG/);
    expect(validateImage({ name: "noextension", size: 1000 }, 0)).toMatch(/JPG/);
    expect(validateImage({ name: "run.exe", size: 1000 }, 0)).toMatch(/JPG/);
  });

  it("rejects empty and oversized files", () => {
    expect(validateImage({ name: "a.jpg", size: 0 }, 0)).toMatch(/empty/);
    expect(validateImage({ name: "a.jpg", size: MAX_BYTES + 1 }, 0)).toMatch(/15 MB/);
    expect(validateImage({ name: "a.jpg", size: MAX_BYTES }, 0)).toBeNull();
  });

  it("limits how many can be attached", () => {
    expect(validateImage(ok, MAX_ATTACHMENTS - 1)).toBeNull();
    expect(validateImage(ok, MAX_ATTACHMENTS)).toMatch(/up to 3/);
  });

  it("only previews formats a browser can show", () => {
    expect(canPreview("a.jpg")).toBe(true);
    expect(canPreview("a.raw")).toBe(false);
    expect(extension("Photo.Final.JPEG")).toBe("jpeg");
    expect(formatSize(512)).toBe("512 B");
    expect(formatSize(2048)).toBe("2 KB");
    expect(formatSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

describe("attachments travel with the ledger entry", () => {
  const history = getScenario("bp_spike").apply(generateHistory(2026, 30));
  const env = makeEnvironment("mars", 22 * 60);
  const T0 = "2026-12-13T08:00:00.000Z";
  const [e] = buildCards(history, env, T0);
  const att: Attachment = {
    name: "ultrasound.jpg",
    source: "ultrasound",
    mime: "image/jpeg",
    sizeBytes: 123_456,
    preview: "data:image/jpeg;base64,AAAA",
  };

  it("are stored on the entry and cross the link with it", () => {
    const entry = createEntry(e.card, e.rule, "Hold", env, T0, [att]);
    expect(entry.attachments).toEqual([att]);
    expect(linkState(entry, T0)).toBe("queued"); // the surgeon does not see it yet
    expect(linkState(entry, "2026-12-13T08:22:00.000Z")).toBe("delivered");
  });

  it("default to none", () => {
    expect(createEntry(e.card, e.rule, "Hold", env, T0).attachments).toEqual([]);
  });
});
