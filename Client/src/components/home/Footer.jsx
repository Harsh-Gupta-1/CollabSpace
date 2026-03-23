export default function Footer({ 
  scrollToSection, 
  setShowSignupModal 
}) {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/10 py-16 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.svg" alt="CollabSpace Logo" className="w-8 h-8" />
            <span className="font-headline font-bold text-xl tracking-tight">
              CollabSpace
            </span>
          </div>
          <p className="text-on-surface-variant text-[10px] font-label uppercase tracking-[0.3em]">
            Precision Collaboration Platform 2024
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-12">
          <a
            href="https://github.com/Harsh-Gupta-1"
            target="_blank"
            rel="noopener noreferrer"
            className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-secondary transition-colors"
          >
            GitHub Repo
          </a>
          <button
            onClick={() => scrollToSection("features")}
            className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-secondary transition-colors"
          >
            API Spec
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-secondary transition-colors"
          >
            System Status
          </button>
          <button
            onClick={() => setShowSignupModal(true)}
            className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant hover:text-secondary transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </footer>
  );
}