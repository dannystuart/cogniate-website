import type { Metadata } from "next";
import DesignSystemClient from "./DesignSystemClient";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return <DesignSystemClient />;
}
