import { useState } from "react";

export default function AuthModals({
  showLoginModal,
  showSignupModal,
  loginData,
  setLoginData,
  signupData,
  setSignupData,
  handleLogin,
  handleSignup,
  loading,
  closeModals,
  setShowLoginModal,
  setShowSignupModal,
}) {
  const [activeTab, setActiveTab] = useState(showSignupModal ? "signup" : "login");

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const passwordsMatch = signupData.password === signupData.confirmPassword;
  const showPasswordMismatch =
    signupData.confirmPassword.length > 0 && !passwordsMatch;

  const isOpen = showLoginModal || showSignupModal;
  if (!isOpen) return null;

  const currentTab = showSignupModal ? "signup" : "login";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface/80 backdrop-blur-sm">
      {/* Authentication Modal: The Tactical Blueprint */}
      <div className="relative w-full max-w-4xl bg-surface-container border border-outline-variant/30 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Technical Specs / Identity */}
        <div className="hidden md:flex flex-col w-2/5 p-8 bg-surface-container-high border-r border-outline-variant/30 relative">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <span className="material-symbols-outlined text-9xl">terminal</span>
          </div>
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="font-label text-xs uppercase tracking-widest text-primary">
                System Auth v2.04
              </span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <img src="/logo.svg" alt="CollabSpace Logo" className="w-10 h-10" />
              <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">
                CollabSpace
              </h1>
            </div>
            <p className="font-label text-xs text-on-surface-variant uppercase mt-1">
              Tactical Blueprint
            </p>
          </div>
          <div className="mt-auto space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end border-b border-outline-variant/20 pb-1">
                <span className="font-label text-[10px] uppercase text-on-surface-variant">
                  Core Engine
                </span>
                <span className="font-mono text-xs text-primary">
                  KINETIC_GRID
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-outline-variant/20 pb-1">
                <span className="font-label text-[10px] uppercase text-on-surface-variant">
                  Encryption
                </span>
                <span className="font-mono text-xs text-primary">
                  AES-256-GCM
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-outline-variant/20 pb-1">
                <span className="font-label text-[10px] uppercase text-on-surface-variant">
                  Latency Target
                </span>
                <span className="font-mono text-xs text-primary">&lt;12ms</span>
              </div>
            </div>
            <div className="p-4 bg-surface-container-lowest rounded border border-outline-variant/10">
              <p className="font-mono text-[10px] text-on-surface-variant leading-relaxed">
                [AUTH_NOTICE]: Unauthorized access attempts are logged and reported
                to the system administrator. Ensure your workspace identity is
                verified before deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Interaction Zone */}
        <div className="flex-1 p-8 md:p-12 bg-surface-container relative">
          {/* Close Button */}
          <button
            onClick={closeModals}
            className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Modal Navigation */}
          <div className="flex items-center gap-8 mb-10 border-b border-outline-variant/10">
            <button
              onClick={() => {
                setShowLoginModal(true);
                setShowSignupModal(false);
              }}
              className={`pb-4 font-label text-sm uppercase tracking-widest transition-colors ${
                currentTab === "login"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setShowLoginModal(false);
                setShowSignupModal(true);
              }}
              className={`pb-4 font-label text-sm uppercase tracking-widest transition-colors ${
                currentTab === "signup"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {currentTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant block">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg text-outline">
                      alternate_email
                    </span>
                  </div>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-sm py-3 pl-10 transition-all outline-none"
                    placeholder="user@collabspace.tech"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant block">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg text-outline">
                      lock_open
                    </span>
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-sm py-3 pl-10 pr-10 transition-all outline-none"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showLoginPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-on-primary font-label text-sm uppercase tracking-[0.2em] font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_24px_-4px_rgba(115,255,227,0.2)] disabled:opacity-50"
              >
                {loading ? "Authorizing..." : "Authorize Access"}
              </button>
            </form>
          )}

          {/* Signup Form */}
          {currentTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant block">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg text-outline">
                      person
                    </span>
                  </div>
                  <input
                    type="text"
                    value={signupData.username}
                    onChange={(e) =>
                      setSignupData({ ...signupData, username: e.target.value })
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-sm py-3 pl-10 transition-all outline-none"
                    placeholder="developer_alpha"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant block">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg text-outline">
                      alternate_email
                    </span>
                  </div>
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-sm py-3 pl-10 transition-all outline-none"
                    placeholder="user@collabspace.tech"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant block">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg text-outline">
                      lock_open
                    </span>
                  </div>
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface text-sm py-3 pl-10 pr-10 transition-all outline-none"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showSignupPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-variant">
                  Must contain at least one uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant block">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg text-outline">
                      lock
                    </span>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`w-full bg-surface-container-lowest border text-on-surface text-sm py-3 pl-10 pr-10 transition-all outline-none ${
                      showPasswordMismatch
                        ? "border-error focus:border-error focus:ring-error"
                        : signupData.confirmPassword.length > 0 && passwordsMatch
                        ? "border-secondary focus:border-secondary focus:ring-secondary"
                        : "border-outline-variant/30 focus:border-primary focus:ring-primary"
                    }`}
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {showPasswordMismatch && (
                  <p className="text-[10px] text-error">Tokens do not match</p>
                )}
                {signupData.confirmPassword.length > 0 && passwordsMatch && (
                  <p className="text-[10px] text-secondary">Tokens match</p>
                )}
              </div>

              {/* Primary Action */}
              <button
                type="submit"
                disabled={loading || showPasswordMismatch}
                className="w-full py-4 bg-primary text-on-primary font-label text-sm uppercase tracking-[0.2em] font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_24px_-4px_rgba(115,255,227,0.2)] disabled:opacity-50"
              >
                {loading ? "Initializing..." : "Initialize Account"}
              </button>
            </form>
          )}

          {/* Footer Text */}
          {/* <div className="mt-8 text-center">
            <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
              Kinetic Grid System 2024. All protocols observed.
            </p>
          </div> */}
        </div>

        {/* Decorative Blueprint Corners */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40 -translate-x-1 -translate-y-1"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40 translate-x-1 -translate-y-1"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40 -translate-x-1 translate-y-1"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40 translate-x-1 translate-y-1"></div>
      </div>
    </div>
  );
}