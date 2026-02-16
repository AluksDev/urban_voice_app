import "./LoadingSpinner.css";

interface SpinnerProps {
  fullScreen?: boolean;
  size?: "small" | "medium" | "large";
}

const LoadingSpinner = ({ fullScreen, size = "medium" }: SpinnerProps) => {
  return (
    <div
      className={`spinner-wrapper ${fullScreen ? "full-screen" : ""} ${size}`}
    >
      <div className="spinner-ring">
        <div className="spinner-core"></div>
        <div className="spinner-glass-shimmer"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
