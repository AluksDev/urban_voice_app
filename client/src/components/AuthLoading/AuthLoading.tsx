import "./AuthLoading.css";

const AuthLoading = () => {
  return (
    <div className="auth-loading-viewport">
      <div className="auth-glass-card">
        <div className="auth-scanner-container">
          <div className="auth-ring"></div>
          <div className="auth-ring-inner"></div>
          <div className="auth-scan-line"></div>
        </div>
        <h2 className="auth-text">Verifying Identity</h2>
        <div className="auth-status-bar">
          <div className="auth-progress-fill"></div>
        </div>
        <p className="auth-subtext">Securing your connection...</p>
      </div>
    </div>
  );
};

export default AuthLoading;
