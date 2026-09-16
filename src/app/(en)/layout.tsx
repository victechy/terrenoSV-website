import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      <main className="flex-1">{children}</main>
      <Footer locale="en" />
    </>
  );
}
