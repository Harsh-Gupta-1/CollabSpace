export default function Navbar({
  scrollToSection,
  setShowLoginModal,
  setShowSignupModal,
}) {
  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="CollabSpace Logo" className="w-8 h-8" />
          <span className="font-headline font-bold text-xl tracking-tight text-on-surface">
            CollabSpace
          </span>
        </div>
        <div className="hidden md:flex gap-8">
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors"
          >
            Features
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={() => setShowLoginModal(true)}
          className="font-label text-xs uppercase tracking-[0.2em] px-5 py-2.5 border border-outline-variant/30 hover:border-primary transition-all"
        >
          Dashboard
        </button>
        <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden ring-1 ring-outline-variant/10">
          <img
            alt="User Profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpSiCw-bG41a-TqR_8B_DOSJa6N6DCvXply_lOb8PSDZEHnXmQt7bV1-ji4DBguAI_bL_BaBopIt7140U7MoDlknt2pCuDMnIMeBw9FA6bjYhrXbYUW9C9LpcSp5FjdLEMLRtryR4Fxe3H1PpmIZDJ5ohDrjdtcDOnMiBJFvtWrZnhTDxq8qvNOHvnG0IZw_98aGMicyAHz__qStEPUuNhPAptdbQMlH-DjKdlYVpIDx9cRGIe1Cg1m8dIQmNqrnb4n7Y6CoKWOlwv"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
}