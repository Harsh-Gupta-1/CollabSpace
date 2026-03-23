export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Initialize",
      description:
        "Spin up a secure, sandboxed workspace with one command. No registration needed.",
      color: "primary",
    },
    {
      number: "02",
      title: "Deploy Link",
      description:
        "Distribute the encrypted room URL. Up to 50 engineers per concurrent node.",
      color: "secondary",
    },
    {
      number: "03",
      title: "Collaborate",
      description:
        "Real-time synchronization for diagrams, code, and terminal outputs.",
      color: "tertiary",
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case "primary":
        return "border-primary/40 text-primary shadow-[0_0_15px_-5px_rgba(115,255,227,0.4)]";
      case "secondary":
        return "border-secondary/40 text-secondary shadow-[0_0_15px_-5px_rgba(195,244,0,0.4)]";
      case "tertiary":
        return "border-tertiary/40 text-tertiary shadow-[0_0_15px_-5px_rgba(255,164,76,0.4)]";
      default:
        return "border-primary/40 text-primary shadow-[0_0_15px_-5px_rgba(115,255,227,0.4)]";
    }
  };

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          {/* Decorative Line */}
          <div className="hidden md:block absolute top-[23px] left-0 w-full h-px bg-outline-variant/20 z-0"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div
                className={`w-12 h-12 bg-background border ${getColorClasses(step.color)} font-label font-bold text-xs flex items-center justify-center mb-10`}
              >
                {step.number}
              </div>
              <h4 className="font-headline font-bold text-lg mb-4 uppercase tracking-wider">
                {step.title}
              </h4>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-[240px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}