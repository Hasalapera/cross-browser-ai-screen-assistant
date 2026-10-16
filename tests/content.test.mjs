import test from "node:test";
import assert from "node:assert/strict";
import { loadModules, SRC } from "./harness.mjs";

const MODULES = [
  SRC.browserApi,
  SRC.messages,
  SRC.state,
  SRC.selection,
  SRC.panel,
  SRC.content
];

test("T-NFR-005-2: content error reporting contains a gone-receiver rejection", () => {
  const docListeners = {};
  const sent = [];
  const doc = {
    addEventListener(type, handler) {
      (docListeners[type] = docListeners[type] || []).push(handler);
    },
    getSelection() {
      throw new Error("selection exploded");
    }
  };

  function resolving(value) {
    const thenable = {
      then(onFulfilled) {
        if (typeof onFulfilled === "function") {
          onFulfilled(value);
        }
        return thenable;
      },
      catch() {
        return thenable;
      }
    };
    return thenable;
  }

  const runtime = {
    onMessage: { addListener() {} },
    sendMessage(message) {
      if (message.type === "CBASA_GET_STATE") {
        return resolving({ active: true });
      }
      const tracking = { rejectionHandled: false };
      sent.push({ message, tracking });
      const thenable = {
        then() {
          return thenable;
        },
        catch(onRejected) {
          if (typeof onRejected === "function") {
            tracking.rejectionHandled = true;
          }
          return thenable;
        }
      };
      return thenable;
    }
  };

  loadModules(MODULES, { chrome: { runtime }, document: doc });

  assert.ok(docListeners.mouseup && docListeners.mouseup.length === 1);
  docListeners.mouseup[0]();

  const report = sent.find((s) => s.message.type === "CBASA_REPORT_ERROR");
  assert.ok(report, "a handled selection error is reported to the background");
  assert.equal(
    report.tracking.rejectionHandled,
    true,
    "the reporter contains any transport rejection"
  );
});
