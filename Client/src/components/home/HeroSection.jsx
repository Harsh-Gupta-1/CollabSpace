import KineticIllustration from "./KineticIllustration";

export default function HeroSection({
  setShowSignupModal,
  scrollToSection,
}) {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-20 px-6 dot-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none"></div>
      <div className="relative z-10 text-center max-w-4xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-container-high border border-outline-variant/20 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">
            Version 2.0.4 Operational
          </span>
        </div>
        <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
          Think Together.
          <br />
          <span className="text-primary italic">Build Together.</span>
        </h1>
        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed">
          The precision-engineered workspace for technical teams. Synchronous
          whiteboarding and distributed code execution.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={() => setShowSignupModal(true)}
            className="group relative px-10 py-5 bg-primary text-on-primary font-label font-bold text-xs uppercase tracking-[0.2em] rounded-sm custom-glow overflow-hidden"
          >
            <span className="relative z-10">Start a Room</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="px-10 py-5 border border-outline-variant/30 hover:border-secondary text-on-surface font-label text-xs uppercase tracking-[0.2em] rounded-sm transition-all bg-surface/40 backdrop-blur-sm"
          >
            Join a Room
          </button>
        </div>
      </div>

      {/* Kinetic Illustration */}
      <KineticIllustration />
    </section>
  );
}