export default function KineticIllustration() {
  return (
    <div className="relative w-full max-w-5xl aspect-[16/9] bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] mb-20 group">
      {/* Frame Decoration */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-surface-container-highest/80 backdrop-blur-sm border-b border-outline-variant/20 flex items-center px-4 gap-2 z-40">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-error/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-secondary/40"></div>
        </div>
        <div className="ml-4 px-3 py-1 bg-surface-container border border-outline-variant/10 rounded-sm">
          <span className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase">
            node_active: precision_alpha
          </span>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="absolute inset-0 pt-10 flex">
        {/* Left: Whiteboard Canvas */}
        <div className="flex-1 relative ui-grid overflow-hidden bg-surface-container-low">
          {/* SVG Architectural Elements */}
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <marker
                id="arrowhead"
                markerHeight="7"
                markerWidth="10"
                orient="auto"
                refX="0"
                refY="3.5"
              >
                <polygon fill="#73ffe3" points="0 0, 10 3.5, 0 7"></polygon>
              </marker>
            </defs>
            <rect
              fill="none"
              height="120"
              stroke="#73ffe3"
              strokeDasharray="4"
              strokeWidth="1"
              width="180"
              x="100"
              y="80"
            ></rect>
            <text
              fill="#73ffe3"
              fontFamily="JetBrains Mono"
              fontSize="10"
              x="110"
              y="100"
            >
              Load Balancer
            </text>
            <path
              d="M280 140 L380 140"
              fill="none"
              markerEnd="url(#arrowhead)"
              stroke="#73ffe3"
              strokeWidth="1"
            ></path>
            <rect
              fill="#73ffe310"
              height="80"
              stroke="#73ffe3"
              strokeWidth="1"
              width="120"
              x="390"
              y="100"
            ></rect>
            <text
              fill="#73ffe3"
              fontFamily="JetBrains Mono"
              fontSize="10"
              x="400"
              y="125"
            >
              API Gateway
            </text>
          </svg>

          {/* Cursors */}
          <div className="absolute top-1/4 left-1/3 cursor-anim pointer-events-none">
            <svg
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 2l12 11.2l-5.8 0.8l4 6.2l-2.4 1.2l-4-6.2l-3.8 4.4z"
                fill="#73ffe3"
              ></path>
            </svg>
            <div className="absolute top-full left-1/2 bg-primary text-on-primary px-2 py-0.5 font-mono text-[8px] whitespace-nowrap">
              @dev_alpha
            </div>
          </div>
          <div
            className="absolute bottom-1/3 right-1/4 cursor-anim pointer-events-none"
            style={{ animationDelay: "-2s" }}
          >
            <svg
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7 2l12 11.2l-5.8 0.8l4 6.2l-2.4 1.2l-4-6.2l-3.8 4.4z"
                fill="#ffa44c"
              ></path>
            </svg>
            <div className="absolute top-full left-1/2 bg-tertiary text-on-tertiary px-2 py-0.5 font-mono text-[8px] whitespace-nowrap">
              @arch_lead
            </div>
          </div>
        </div>

        {/* Right: Code & Chat Panel */}
        <div className="w-80 border-l border-outline-variant/20 flex flex-col bg-surface-container-high/40 backdrop-blur-sm">
          {/* Code Editor Panel */}
          <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed border-b border-outline-variant/20 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant text-[9px] uppercase tracking-widest">
                server.ts
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              </div>
            </div>
            <div className="space-y-1">
              <p>
                <span className="text-tertiary">import</span> {"{"} serve {"}"}{" "}
                <span className="text-tertiary">from</span>{" "}
                <span className="text-secondary">&quot;std/http&quot;</span>;
              </p>
              <p>&nbsp;</p>
              <p>
                <span className="text-primary">const</span> port ={" "}
                <span className="text-secondary">8080</span>;
              </p>
              <p>
                <span className="text-primary">const</span> handler = (req:{" "}
                <span className="text-primary-dim">Request</span>) ={"}"} {"{"}
              </p>
              <p>
                &nbsp;&nbsp;
                <span className="text-on-surface-variant">
                  // Latency optimization
                </span>
              </p>
              <p>
                &nbsp;&nbsp;<span className="text-tertiary">return</span>{" "}
                <span className="text-primary">new</span> Response(
                <span className="text-secondary">&quot;ACK&quot;</span>);
              </p>
              <p>{"}"};</p>
              <p>&nbsp;</p>
              <p>
                console.log(<span className="text-secondary">&quot;Active on :&quot;</span>{" "}
                + port);
              </p>
              <div className="w-1 h-4 bg-primary inline-block animate-pulse align-middle"></div>
            </div>
          </div>

          {/* Chat Sidebar Section */}
          <div className="h-48 flex flex-col p-4">
            <div className="text-on-surface-variant text-[9px] uppercase tracking-widest mb-3">
              Spatial Chat
            </div>
            <div className="space-y-3 overflow-hidden">
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/40"></div>
                <p className="text-[10px] text-on-surface-variant">
                  <span className="text-primary">@dev_alpha:</span> Adjusting LB
                  logic...
                </p>
              </div>
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-tertiary/20 border border-tertiary/40"></div>
                <p className="text-[10px] text-on-surface-variant">
                  <span className="text-tertiary">@arch_lead:</span> Looks good.
                  Verify the ports.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-outline-variant/10">
                <div className="text-[9px] text-outline italic">
                  @user_3 typing...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none z-30"></div>
    </div>
  );
}
