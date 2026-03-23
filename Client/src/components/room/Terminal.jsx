export default function Terminal({ output }) {
  const safeOutput = output || "";

  return (
    <section className="h-full bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col z-20">
      <div className="bg-surface-container-high px-4 py-1.5 flex items-center justify-between border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Terminal</span>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface cursor-pointer">Debug Console</span>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface cursor-pointer">Output</span>
        </div>
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-sm text-on-surface-variant hover:text-primary cursor-pointer">add</span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant hover:text-primary cursor-pointer">delete</span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant hover:text-primary cursor-pointer">close</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-[11px] text-on-surface-variant/80 space-y-1 custom-scrollbar">
        <div className="flex gap-2">
          <span className="text-secondary-dim">[{new Date().toLocaleTimeString('en-US', {hour12:false})}]</span>
          <span className="text-on-surface">System active. Ready for code execution.</span>
        </div>
        
        {safeOutput && (
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex gap-2">
              <span className="text-secondary-dim">[{new Date().toLocaleTimeString('en-US', {hour12:false})}]</span>
              <span className="text-primary">Execution Output:</span>
            </div>
            {safeOutput.split('\n').map((line, idx) => (
              <div key={idx} className="flex gap-2 text-on-surface whitespace-pre-wrap ml-14">
                {line}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 group mt-2">
          <span className="text-primary-dim">user@collabspace:~/var/temp$</span>
          <span className="text-on-surface flex items-center"><span className="w-2 h-4 bg-primary/40 ml-1 animate-pulse"></span></span>
        </div>
      </div>
    </section>
  );
}