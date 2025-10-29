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

// Provide a minimal Google API client facade so Drive sync tests can run offline.
if (!("gapi" in globalThis)) {
  globalThis.gapi = {
    load: createStub(),
    auth2: {},
    client: {}
  };
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
