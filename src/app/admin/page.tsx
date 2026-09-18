import type { Metadata } from "next";
import { Suspense } from "react";
import AdminView from "@/components/views/AdminView";

export const metadata: Metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminView />
    </Suspense>
  );
}
