const ButtonsSpinner = ({ color = "#ffffff", thickness = 4 }) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      strokeWidth={thickness}
      strokeDasharray="80 30"
      strokeLinecap="round"
      style={{
        animation: "spin 1.5s linear infinite",
        transformOrigin: "center",
      }}
    />
    <style>{`
      @keyframes spin {
        0% { 
          transform: rotate(0deg);
          stroke-dasharray: 1 150;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 90 150;
          stroke-dashoffset: -40;
        }
        100% {
          stroke-dasharray: 90 150;
          stroke-dashoffset: -120;
          transform: rotate(720deg);
        }
      }
    `}</style>
  </svg>
);

export default ButtonsSpinner;
