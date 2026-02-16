import "./Skeleton_stats.css";

const Skeleton_Stats = () => {
  return (
    <section className="stats-container skeleton-stats-wrapper">
      <div className="skeleton-h3-box shimmer"></div>

      <div className="stats-box">
        <div className="skeleton-numeric-column">
          {/* Three numeric stat placeholders */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="numeric-stat skeleton-stat-item">
              <div className="skeleton-number shimmer"></div>
              <div className="skeleton-label shimmer"></div>
            </div>
          ))}
        </div>

        {/* The Pie Chart placeholder */}
        <div className="skeleton-chart-container">
          <div className="skeleton-circle shimmer"></div>
        </div>
      </div>
    </section>
  );
};

export default Skeleton_Stats;
