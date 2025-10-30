/**
 * @file useInstallPrompt.test.js
 * @description Stellt sicher, dass das Hook das beforeinstallprompt-Event abfängt und den
 * Prompt steuerbar macht.
 */

import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import useInstallPrompt from "../../src/hooks/useInstallPrompt.js";

describe("useInstallPrompt", () => {
  let manager;

  const Harness = () => {
    manager = useInstallPrompt();
    return null;
  };

  beforeEach(() => {
    render(<Harness />);
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  const dispatchBeforeInstall = () => {
    const promptSpy = jest.fn();
    const promptEvent = new Event("beforeinstallprompt");
    promptEvent.preventDefault = jest.fn();
    promptEvent.prompt = promptSpy;
    promptEvent.userChoice = Promise.resolve({ outcome: "accepted" });
    act(() => {
      window.dispatchEvent(promptEvent);
    });
    return { promptSpy, promptEvent };
  };

  test("speichert das Installations-Event und ruft prompt() auf", async () => {
    const { promptSpy, promptEvent } = dispatchBeforeInstall();

    expect(manager.installPromptEvent).toBe(promptEvent);

    await act(async () => {
      await manager.promptInstall();
    });

    expect(promptSpy).toHaveBeenCalled();
    expect(manager.installPromptEvent).toBeNull();
  });

  test("setzt das Event zurück, wenn appinstalled ausgelöst wird", () => {
    dispatchBeforeInstall();
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(manager.installPromptEvent).toBeNull();
  });
});
