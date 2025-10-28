import { useCallback, useEffect, useState } from "react";

/**
 * Kapselt den Umgang mit dem `beforeinstallprompt`-Event für PWAs.
 * Der Hook stellt das gespeicherte Event sowie eine Methode bereit,
 * um die Installationsaufforderung gezielt auszulösen.
 */
const useInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  /**
   * Zeigt den Installationsdialog an, sofern das Event verfügbar ist.
   */
  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) {
      return;
    }
    const promptEvent = installPromptEvent;
    promptEvent.prompt();
    try {
      await promptEvent.userChoice;
    } catch (error) {
      console.error("App-Installation konnte nicht abgeschlossen werden:", error);
    } finally {
      setInstallPromptEvent(null);
    }
  }, [installPromptEvent]);

  return {
    installPromptEvent,
    promptInstall
  };
};

export default useInstallPrompt;
