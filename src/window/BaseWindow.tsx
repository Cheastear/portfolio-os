import { FC, PropsWithChildren, useCallback, useRef } from "react";
import { useWindows } from ".";

type BaseWindowProps = {
  id: string;
  title: string;
};

const BaseWindow: FC<PropsWithChildren<BaseWindowProps>> = ({
  id,
  title,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const {
    closeWindow,
    minimizeWindow,
    handleDragWindow,
    window: currWindow,
  } = useWindows(id);

  const calculateOffset = useCallback(
    (movement: "vertical" | "horizontal", offset: number) => {
      if (!containerRef.current) {
        return offset;
      }

      const windowWidth = containerRef.current.offsetWidth;
      const windowHeight = containerRef.current.offsetHeight;

      if (movement === "vertical") {
        const maxTop = window.innerHeight - windowHeight;
        return Math.min(Math.max(0, offset), maxTop);
      } else if (movement === "horizontal") {
        const maxLeft = window.innerWidth - windowWidth;
        return Math.min(Math.max(0, offset), maxLeft);
      }

      return 0;
    },
    [],
  );

  if (!currWindow || currWindow.isMinimized) return null;

  return (
    <div
      ref={containerRef}
      className="absolute bg-gray-400 w-64 h-52 border shadow-2xl"
      style={{
        left: `${calculateOffset("horizontal", currWindow.coords.x)}px`,
        top: `${calculateOffset("vertical", currWindow.coords.y)}px`,
      }}
    >
      <div
        className="bg-gray-500 cursor-move flex justify-between items-center px-2"
        onMouseDown={() => handleDragWindow(id)}
      >
        <span>{title}</span>
        <div className="flex gap-1">
          <button onClick={() => minimizeWindow(id)}>-</button>
          {/* <button>□</button> */}
          <button onClick={() => closeWindow(id)}>×</button>
        </div>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
};

export default BaseWindow;
