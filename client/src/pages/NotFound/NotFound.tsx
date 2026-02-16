import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-viewport">
      <section className="not-found-container">
        <div className="error-code-glitch">404</div>
        <div className="glass-divider"></div>
        <h3>Lost in Space?</h3>
        <p>
          The page you are looking for has been moved, deleted, or never existed
          in this sector.
        </p>

        <button className="home-btn" onClick={() => navigate("/")}>
          Return to Dashboard
        </button>
      </section>

      {/* Decorative background elements to match your board's style */}
      <div className="bg-blur-blob"></div>
      <div className="bg-blur-blob secondary"></div>
    </div>
  );
};

export default NotFound;
