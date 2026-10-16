# Manual Browser Verification Checklist — Phase 1

- **Document ID:** MV-CHECK
- **Version:** 1.0.1
- **Status:** Procedure only — **no browser test has been executed; no result is recorded**
- **Last updated:** 2026-10-17
- **Related:** `docs/requirements/acceptance-criteria.md`,
  `docs/quality/traceability-matrix.md`, `docs/quality/test-strategy.md`,
  `docs/quality/known-limitations.md`, `docs/development/phase-1-plan.md`

## 1. Purpose and rules

Procedure to execute the Phase 1 acceptance criteria that require a **live
browser**. Static/local criteria (`NFR-003`, `NFR-004`, `SEC-002`, `SEC-010`) are
already covered by `scripts/governance-check.py` and `node --test` and are out of
scope here.

- Record results **per browser and per browser version** (BCR-004). A Chromium
  pass never implies a Firefox pass.
- Never mark a requirement `VERIFIED` without a completed row in §6/§7 and named
  evidence. This document alone changes no status.
- Do not weaken any security control while testing, and do not use test pages or
  tools that transmit page content.
- The MVP performs **no network access** (NFR-006, SEC-009); a test page served
  over `http://localhost` is fine, but no data may leave the browser.

## 2. Preconditions

1. Build both packages from the repository root:

   ```sh
   python3 scripts/build-extension.py
   ```

   Expected: `dist/chromium/` and `dist/firefox/` each contain `manifest.json`,
   `background.js`, `content.js`, `popup.js`, `popup.html`, `popup.css`.
   Pending updates are made to `src/`, then rebuilt — never edit `dist/`.

2. Create a local test page (save **outside the repo**, e.g. `/tmp/cbasa-test.html`)
   and serve it, so `activeTab` applies to an ordinary page:

   ```sh
   python3 -m http.server 8000 --directory /tmp
   ```

   ```html
   <!doctype html>
   <meta charset="utf-8" />
   <title>CBASA test page</title>
   <p id="plain">The quick brown fox jumps over the lazy dog.</p>
   <p id="markup">&lt;img src=x onerror=alert(1)&gt; not an image</p>
   <input id="field" value="editable text field" />
   <iframe src="/cbasa-test.html" width="200" height="80"></iframe>
   ```

3. Record the run metadata once per browser:

   | Field | Value |
   | --- | --- |
   | Browser + exact version | |
   | OS + version | |
   | Extension version | 0.2.0 |
   | Source commit (`git rev-parse --short HEAD`) | |
   | Tester | |
   | Date | |

## 3. Chromium — load unpacked

Target: `dist/chromium` (Chrome; Edge/Brave analogous).

| # | Step | Expected | Maps to |
| --- | --- | --- | --- |
| 3.1 | Open `chrome://extensions`; enable **Developer mode**. | Developer mode active. | AC-BCR-001-1 |
| 3.2 | **Load unpacked** → select `dist/chromium`. | Extension card appears, name shown, version `0.2.0`, **no** "Errors" button/badge. | AC-FR-001-1, AC-BCR-001-1 |
| 3.3 | Card → **Details** → **Permissions** / site access. | No host permission ("all sites"); no "Read and change all your data". Only `storage`, `activeTab`, `scripting` behaviour. | AC-SEC-001-1 |
| 3.4 | Details → **Inspect views: service worker**. | DevTools opens with **no** console errors. | AC-FR-001-1 |
| 3.5 | Inspect the loaded `dist/chromium/manifest.json`. | `manifest_version` 3; no `host_permissions` and no `content_scripts` key. | AC-BCR-001-1, AC-SEC-006-1 |

## 4. Chromium — functional and security checks

Use `/tmp/cbasa-test.html` unless stated otherwise. "Popup" = toolbar icon.

### 4.1 Default, popup, activation

| # | Step | Expected | Maps to |
| --- | --- | --- | --- |
| 4.1.1 | Fresh load; open popup without activating. | Popup shows **Inactive** and an **Activate** button. | AC-FR-002-1, AC-FR-003-3 |
| 4.1.2 | With the popup open, press Tab then Enter/Space. | Button is keyboard-reachable and toggles; it has an accessible name. | AC-NFR-007-1 |
| 4.1.3 | Click **Activate** on the test page. | Popup shows **Active** / **Deactivate**. | AC-FR-003-1 |

### 4.2 Injection, selection, panel

| # | Step | Expected | Maps to |
| --- | --- | --- | --- |
| 4.2.1 | Select `quick brown fox`. | Floating panel appears with title "Selected text" and exactly `quick brown fox`. | AC-FR-004-1, AC-FR-005-1 |
| 4.2.2 | Note panel position while the selection is visible. | Panel is fixed top-right and does **not** cover the selected text. | AC-FR-005-2 |
| 4.2.3 | Elements panel: find `#cbasa-panel-host`. | Host contains an **open shadow root**; inside it a `role="dialog"` card with a `Dismiss` button. | SEC-005 |
| 4.2.4 | Select `&lt;img src=x onerror=alert(1)&gt;` markup text. | Panel shows the **literal characters**; **no** image or alert; content is a text node (no child elements). | AC-SEC-004-1, AC-SEC-005-1 |
| 4.2.5 | Run the latency snippet below, then select new text. | Console logs `cbasa panel latency` **< 200 ms**; record the value. | AC-NFR-001-1 |
| 4.2.6 | Click **Dismiss**. | Panel is removed; `#cbasa-panel-host` is gone; the page otherwise behaves unchanged. | AC-FR-006-1 |
| 4.2.7 | DevTools Network: clear, then select text. | No request is initiated by the extension. | AC-FR-007-1, AC-SEC-009-1 |
| 4.2.8 | Enable **Network → Offline**, then select text. | Selection + panel still work. | AC-NFR-006-1 |

Latency snippet (paste in the **page** console before selecting):

```js
window.__t0 = performance.now();
document.addEventListener("mouseup", () => { window.__t0 = performance.now(); }, true);
new MutationObserver((ms) => {
  for (const m of ms) for (const n of m.addedNodes)
    if (n.id === "cbasa-panel-host")
      console.log("cbasa panel latency ms:", (performance.now() - window.__t0).toFixed(1));
}).observe(document.documentElement, { childList: true, subtree: true });
```

### 4.3 Deactivation, duplicates, errors, reload

| # | Step | Expected | Maps to |
| --- | --- | --- | --- |
| 4.3.1 | Deactivate in the popup, then select text. | **No** panel appears. | AC-FR-003-2, AC-FR-004-2 |
| 4.3.2 | Reactivate, then select text. | Panel appears again. | AC-FR-003-1 |
| 4.3.3 | Toggle activate/deactivate 5×, then select once. | Exactly **one** panel; no duplicates; no console errors. | FR-003 (duplicate-listener guard) |
| 4.3.4 | While active, **reload** the page, then select text without re-activating. | Record actual. Design expectation: the injected script is removed on reload, so **no panel until re-activation**; re-activate → works again. File a defect on divergence. | FR-003 / observation |
| 4.3.5 | Navigate to another URL in the same tab while active, then select. | Same as 4.3.4 (injected script does not survive navigation). | FR-003 / observation |
| 4.3.6 | Cause an error if possible (e.g. activate then select inside the cross-origin `iframe`). | Page stays functional; no uncaught error thrown into the page; any error is contained/reported. | AC-NFR-005-1, AC-BCR-003-1 |
| 4.3.7 | Activate; fully quit and reopen the browser; open popup. | Still **Active** (persisted). | AC-FR-010-1 |
| 4.3.8 | Service worker DevTools → `chrome.storage.local.get(null)`. | Only `{ "active": true }`; **no** selection/page content anywhere. | AC-FR-010-2, AC-SEC-003-1 |
| 4.3.9 | Open several tabs (the test page + another ordinary page + `chrome://settings`), activate on the test page, and watch the **service worker** console. | **No** `Uncaught (in promise)` / "Receiving end does not exist" error; tabs without the injected script are unaffected. | AC-NFR-005-1, AC-BCR-003-1 |

### 4.4 Negative / security tests

| # | Step | Expected | Maps to |
| --- | --- | --- | --- |
| 4.4.1 | Confirm the built manifests list no broad host permission. | No `host_permissions`, no `<all_urls>`, no declared content script. | AC-SEC-001-1, AC-SEC-006-1 |
| 4.4.2 | Leave the assistant **inactive**; open tab B and select text. | No panel; extension does not inject; no `#cbasa-panel-host` in tab B's DOM. | AC-FR-003-3, AC-SEC-006-1 |
| 4.4.3 | Activate on tab A only; select in tab B (never activated). | Tab B is untouched (no panel, no injection). | FR-003, AC-SEC-006-1 |
| 4.4.4 | Try to activate/select on `chrome://settings` and `about:blank`. | Nothing is injected; no error is thrown into the page. | AC-SEC-006-1 |
| 4.4.5 | After dismissing the panel and deactivating, re-check `chrome.storage.local`. | Still only the preference; no captured text retained. | AC-SEC-003-1 |

## 5. Firefox verification (separate)

Firefox is **not installed** in the build environment, so the Firefox package is
built and structurally checked but never loaded. Treat every item below as
`NOT VERIFIED` until a human runs it on a named Firefox version.

Precondition: Firefox stable ≥ `115.0` (matches `strict_min_version`).
Load: `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select
`dist/firefox/manifest.json`.

| # | Check | Expected / what to record | Maps to |
| --- | --- | --- | --- |
| 5.1 | Manifest loads | Extension appears, no manifest errors; record version. | AC-FR-001-2, AC-BCR-002-1 |
| 5.2 | Background type | MV3 uses `background.scripts` (event page), not `service_worker`; background console has no errors. | AC-BCR-002-1 |
| 5.3 | Namespace | `browser.*` is used (preferred over `chrome.*`); no undefined-namespace errors. | AC-BCR-002-1, AC-BCR-003-1 |
| 5.4 | Popup + keyboard | Popup opens; toggle operable by keyboard with accessible name. | AC-FR-002-1, AC-NFR-007-1 |
| 5.5 | Activation + injection | `activeTab` granted via the action click; content script injects on activation. | AC-FR-003-1, AC-FR-004-1 |
| 5.6 | Selection + panel | Selection captured; shadow-DOM panel renders text only; dismisses cleanly. | AC-FR-004-1, AC-FR-005-1, AC-FR-006-1, AC-SEC-005-1 |
| 5.7 | Deactivation / inactive | No capture when inactive. | AC-FR-003-2, AC-FR-004-2 |
| 5.8 | Persistence | Record whether `storage` preference survives a Firefox restart (temporary add-ons may not persist). | AC-FR-010-1 |
| 5.9 | No network | Network monitor shows no extension-initiated requests. | AC-FR-007-1, AC-SEC-009-1 |

Compatibility items still to confirm by execution (do not assume):
`browser.scripting.executeScript` behaviour and promise/callback shape in
Firefox; whether the MV3 event page is suspended and drops in-memory state;
temporary-add-on storage persistence; any `browser_specific_settings` /
signing requirements; and whether a Chromium pass transfers (it does not —
BCR-004).

## 6. Recording template

Fill one table per browser (copy as needed). `Result` ∈ {Pass, Fail, Blocked,
N/A — reason}. Attach console/network evidence for Fail.

| AC ID | Step | Expected result | Result | Evidence / notes |
| --- | --- | --- | --- | --- |
| AC-FR-001-1 | 3.2 | Loads unpacked with no manifest errors | | |
| AC-FR-001-2 | 5.1 | Firefox loads with no manifest errors | | |
| AC-FR-002-1 | 4.1.1 | Popup shows state + control | | |
| AC-FR-003-1 | 4.1.3 | Activation reflects active | | |
| AC-FR-003-2 | 4.3.1 | Deactivation stops observation | | |
| AC-FR-003-3 | 4.1.1, 4.4.2 | Inactive by default | | |
| AC-FR-004-1 | 4.2.1 | Selection captured when active | | |
| AC-FR-004-2 | 4.3.1 | No capture when inactive | | |
| AC-FR-005-1 | 4.2.1 | Panel displayed | | |
| AC-FR-005-2 | 4.2.2 | Panel does not obscure selection | | |
| AC-FR-006-1 | 4.2.6 | Dismiss removes panel, page intact | | |
| AC-FR-007-1 | 4.2.4, 4.2.7 | Text-only render, no network | | |
| AC-FR-010-1 | 4.3.7 | Preference persists across restart | | |
| AC-FR-010-2 | 4.3.8 | Only preference persisted | | |
| AC-NFR-001-1 | 4.2.5 | Panel < 200 ms | | |
| AC-NFR-002-1 | 4.1.1 | No long task at page load | | |
| AC-NFR-005-1 | 4.3.6, 4.3.9 | Errors contained, page functional | | |
| AC-NFR-006-1 | 4.2.8 | Works with networking disabled | | |
| AC-NFR-007-1 | 4.1.2, 5.4 | Keyboard-operable, named controls | | |
| AC-SEC-001-1 | 3.3, 4.4.1 | Only justified permissions | | |
| AC-SEC-003-1 | 4.3.8, 4.4.5 | In-memory only, nothing retained | | |
| AC-SEC-004-1 | 4.2.4 | Selection handled as opaque text | | |
| AC-SEC-005-1 | 4.2.3, 4.2.4 | Text nodes only, no execution | | |
| AC-SEC-006-1 | 4.4.1–4.4.4 | Protected pages untouched, no bypass | | |
| AC-SEC-009-1 | 4.2.7, 5.9 | No outbound calls | | |
| AC-BCR-001-1 | 3.2, 3.5 | Valid MV3 Chromium manifest | | |
| AC-BCR-002-1 | 5.1–5.4 | Firefox-compatible build loads | | |
| AC-BCR-003-1 | 4.3.6, 4.3.9, 5.3 | Missing API degrades, no uncaught error | | |
| AC-BCR-004-1 | §6/§7 | Result recorded per browser/version | | |

Out of scope here (covered locally): AC-NFR-003-1, AC-NFR-004-1, AC-SEC-002-1,
AC-SEC-010-1. Deferred: FR-008, FR-009, SEC-007, SEC-008.

## 7. Troubleshooting

- **Manifest errors** — read the error text under the extension card. Validate
  JSON: `python3 -m json.tool dist/chromium/manifest.json`. Confirm you loaded a
  built `dist/` folder (not `src/`). After rebuilding, click **Reload**.
- **Missing popup UI** — confirm `action.default_popup` is `popup.html` and
  `popup.html`, `popup.css`, `popup.js` exist in the loaded folder. Open the
  popup, right-click → **Inspect**, and read the popup console (CSP forbids
  inline scripts; the popup uses an external `popup.js`).
- **Failed script injection** — the `scripting` permission must be present;
  injection happens only after a user gesture on the active tab; protected pages
  (`chrome://`, the Web Store, the built-in PDF viewer) cannot be injected.
  Confirm `content.js` exists in the package and check the service-worker
  console for errors.
- **Browser console errors** — use the right console: service worker
  (`chrome://extensions` → Inspect), popup (right-click popup → Inspect), or the
  page's isolated-world context (DevTools Console → context selector → the
  extension). Any uncaught error is a defect (NFR-005).
- **Panel not appearing** — the assistant must be active, the selection
  non-empty, and the content script injected on **that** tab (activate there);
  a page reload/navigation removes the injected script (re-activate).
- **State not persisting** — verify the `storage` permission; inspect
  `chrome.storage.local`. Temporary Firefox add-ons may not persist across
  restarts.

## 8. Evidence and status rules

- A requirement becomes `VERIFIED` only when every one of its criteria has a
  passing row in §6 on a **named browser version**.
- Update `docs/quality/traceability-matrix.md` statuses and notes only after
  recording real results, per browser (BCR-004).
- Record any newly discovered runtime limitation in
  `docs/quality/known-limitations.md`.
- This document itself does not change any status.
