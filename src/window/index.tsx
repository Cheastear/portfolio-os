"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";
import BaseWindow from "./BaseWindow";
import { WindowInstance } from "@/types/window";
import { getDefaultCoords } from "@/helpers";

type WindowsContextType = {
  windows: Record<WindowInstance["id"], WindowInstance>;
  openWindow: (
    window: Pick<WindowInstance, "id" | "title" | "content">,
  ) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  handleDragWindow: (id: string) => void;
};

const WindowsContext = createContext<WindowsContextType | null>(null);

export const WindowsProvider = ({ children }: { children: ReactNode }) => {
  const [windows, setWindows] = useState<
    Record<WindowInstance["id"], WindowInstance>
  >({});
  const [dragging, setDragging] = useState<false | string>(false);

  const globalZIndex = useRef(1);

  const openWindow = useCallback(
    (window: Pick<WindowInstance, "id" | "title" | "content">) =>
      setWindows((prev) => {
        const existing = prev[window.id];
        if (existing) {
          globalZIndex.current++;
          return {
            ...prev,
            [window.id]: {
              ...existing,
              isMinimized: false,
              isFocus: true,
              zIndex: globalZIndex.current,
            },
          };
        }

        return {
          ...prev,
          [window.id]: {
            isFocus: true,
            isMinimized: false,
            zIndex: globalZIndex.current + 1,
            coords: getDefaultCoords(),
            isOpen: true,
            ...window,
          },
        };
      }),
    [],
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const window = prev[id];
      if (!window) return prev;
      return {
        ...prev,
        [id]: { ...window, isMinimized: true },
      };
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    globalZIndex.current++;
    setWindows((prev) => {
      const window = prev[id];
      if (!window) return prev;
      return {
        ...prev,
        [id]: { ...window, zIndex: globalZIndex.current },
      };
    });
  }, []);

  const handleMouseDown = (id: string) => {
    setDragging(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;

    // Stop dragging if cursor leaves the viewport
    if (
      e.clientX < 0 ||
      e.clientX > window.innerWidth ||
      e.clientY < 0 ||
      e.clientY > window.innerHeight
    ) {
      setDragging(false);
      return;
    }

    setWindows((prev) => {
      const windowInstance = prev[dragging];
      if (!windowInstance) return prev;

      return {
        ...prev,
        [dragging]: {
          ...windowInstance,
          coords: {
            x: (windowInstance.coords?.x ?? 0) + e.movementX,
            y: (windowInstance.coords?.y ?? 0) + e.movementY,
          },
        },
      };
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDragging(false);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <WindowsContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        focusWindow,
        handleDragWindow: handleMouseDown,
      }}
    >
      <div
        className="w-full h-dvh"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {children}
        {Object.values(windows).map((window) => (
          <BaseWindow id={window.id} title={window.title} key={window.id}>
            {window.content}
          </BaseWindow>
        ))}
      </div>
    </WindowsContext.Provider>
  );
};

export const useWindows = (id?: string) => {
  const context = useContext(WindowsContext);

  if (!context) {
    throw new Error("useWindows must be used within a WindowsProvider");
  }

  if (id) {
    const windowInstance = context.windows[id];
    if (!windowInstance) {
      throw new Error(`Window with id '${id}' not found`);
    }
    return { ...context, window: windowInstance };
  }

  return { ...context, window: null };
};
