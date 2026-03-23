import { useState } from 'react';

export default function FeaturesSection() {
  const features = [
    {
      icon: "architecture",
      title: "Technical Whiteboarding",
      description:
        "Low-latency vector canvas optimized for complex system design. Snap-to-grid accuracy for architectural purity.",
      color: "primary",
      span: "md:col-span-7",
    },
    {
      icon: "terminal",
      title: "Cloud Execution",
      description:
        "Write and execute code in shared containers. Synchronized state across all connected clients.",
      color: "secondary",
      span: "md:col-span-5",
    },
    {
      icon: "forum",
      title: "Contextual Sync",
      description:
        "Voice channels and spatial chat that understands your position on the infinite canvas.",
      color: "tertiary",
      span: "md:col-span-5",
    },
    {
      icon: "dns",
      title: "Edge Infrastructure",
      description:
        "Global relay network ensures sub-50ms latency for teams distributed across continents.",
      color: "primary",
      span: "md:col-span-7",
    },
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case "primary":
        return {
          iconBg: "bg-primary/10 border-primary/20",
          iconText: "text-primary",
          glow: "group-hover:bg-primary/10",
        };
      case "secondary":
        return {
          iconBg: "bg-secondary/10 border-secondary/20",
          iconText: "text-secondary",
          glow: "",
        };
      case "tertiary":
        return {
          iconBg: "bg-tertiary/10 border-tertiary/20",
          iconText: "text-tertiary",
          glow: "",
        };
      default:
        return {
          iconBg: "bg-primary/10 border-primary/20",
          iconText: "text-primary",
          glow: "",
        };
    }
  };

  return (
    <section
      id="features"
      className="py-24 px-6 bg-surface-container-low border-y border-outline-variant/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-12 bg-primary"></div>
            <p className="text-primary font-label text-[11px] tracking-[0.4em] uppercase">
              Architecture & Execution
            </p>
          </div>
          <h2 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none">
            Engineered for Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {features.map((feature, index) => {
            const colors = getColorClasses(feature.color);
            const isLarge = feature.span === "md:col-span-7";

            return (
              <div
                key={index}
                className={`${feature.span} bg-surface ${isLarge ? "p-10" : "bg-surface-container-high p-10"} rounded-lg border border-outline-variant/${isLarge ? "10" : "20"} relative overflow-hidden group card-texture flex flex-col justify-between`}
              >
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 flex items-center justify-center ${colors.iconBg} border rounded-sm mb-8`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${colors.iconText}`}>
                      {feature.icon}
                    </span>
                  </div>
                  <h3
                    className={`font-headline ${isLarge ? "text-2xl" : "text-xl"} font-bold mb-4 tracking-tight`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-on-surface-variant ${isLarge ? "max-w-sm" : ""} leading-relaxed text-sm`}
                  >
                    {feature.description}
                  </p>
                </div>
                {isLarge && feature.color === "primary" && (
                  <div
                    className={`absolute right-[-10%] top-[-10%] w-[40%] aspect-square bg-primary/5 rounded-full blur-[80px] ${colors.glow} transition-colors`}
                  ></div>
                )}
                {isLarge && feature.icon === "dns" && (
                  <div className="absolute right-8 bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="material-symbols-outlined text-[120px]">
                      electric_bolt
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}