import { Footer } from "../footer";
import { Header } from "../header";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header />
      <main className="grow">
        <div className="max-w-[1600px] w-full mx-auto py-8 px-4 sm:px-8 lg:px-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
