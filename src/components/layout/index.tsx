import { Footer } from "../footer";
import { Header } from "../header";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="grow bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
