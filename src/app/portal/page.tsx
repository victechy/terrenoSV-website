import type { Metadata } from "next";
import { Suspense } from "react";
import PortalView from "@/components/views/PortalView";

export const metadata: Metadata = {
  title: "Portal de vendedores",
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <Suspense fallback={null}>
      <PortalView />
    </Suspense>
  );
}
