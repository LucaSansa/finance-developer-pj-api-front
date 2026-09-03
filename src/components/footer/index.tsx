export function Footer() {
  return (
    <footer className="border-t border-line-soft">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-5 text-center text-xs text-ink-muted">
        &copy; {new Date().getFullYear()} LPM Systems. Todos os direitos reservados.
      </div>
    </footer>
  );
}
