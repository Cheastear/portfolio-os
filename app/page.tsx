"use client";

import { useWindows } from "@/src/window";
import { useEffect } from "react";

export default function Home() {
  const { openWindow } = useWindows();

  return (
    <div>
      <button
        onClick={() =>
          openWindow({
            id: "test",
            title: "Test",
            content: <h1>qwerty</h1>,
          })
        }
      >
        qwer
      </button>
    </div>
  );
}
