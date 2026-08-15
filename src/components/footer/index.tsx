export function Footer() {
  return (
    <footer className="bg-white shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} LPM Systems. All rights reserved.
      </div>
    </footer>
  );
}
