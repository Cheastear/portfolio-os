import { ReactNode } from "react";

export type WindowInstance = {
  id: string;
  title: string;
  isFocus: boolean;
  isMinimized: boolean;
  isOpen: boolean;
  zIndex: number;
  coords: { x: number; y: number };

  content?: ReactNode;
};
