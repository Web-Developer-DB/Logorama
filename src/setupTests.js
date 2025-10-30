/**
 * @file setupTests.js
 * @description Gemeinsamer Jest-Setup für React Testing Library. Stellt DOM-/PWA-Stubs bereit
 * und dokumentiert optionale Erweiterungen (Accessibility, MSW).
 */

import "@testing-library/jest-dom";

// Helper to create a mock function regardless of whether Jest globals exist yet.
const createStub = () => (globalThis.jest?.fn ? globalThis.jest.fn() : () => {});

// Ensure navigator is present so service worker stubbing works reliably.
if (typeof globalThis.navigator === "undefined") {
  Object.defineProperty(globalThis, "navigator", {
    value: {},
    configurable: true,
    writable: true
  });
}

// Service worker registration is triggered in main.jsx; provide a safe stub.
if (!("serviceWorker" in globalThis.navigator)) {
  Object.defineProperty(globalThis.navigator, "serviceWorker", {
    value: { register: createStub() },
    configurable: true
  });
}

// File System Access API stubs used by the backup/export flows.
if (!("showOpenFilePicker" in globalThis)) {
  globalThis.showOpenFilePicker = createStub();
}
if (!("showSaveFilePicker" in globalThis)) {
  globalThis.showSaveFilePicker = createStub();
}

// Optional integrations:
// - Accessibility: uncomment to enable jest-axe helpers
//   import { axe, toHaveNoViolations } from "jest-axe";
//   expect.extend(toHaveNoViolations);
//   export async function a11yCheck(container) {
//     expect(await axe(container)).toHaveNoViolations();
//   }
//
// - Mock Service Worker: uncomment when MSW is configured
//   import { server } from "../__mocks__/server";
//   beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
//   afterEach(() => server.resetHandlers());
//   afterAll(() => server.close());
