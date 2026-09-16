import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="es" />
      <main className="flex-1">{children}</main>
      <Footer locale="es" />
    </>
  );
}
