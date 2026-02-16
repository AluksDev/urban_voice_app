import "./Skeleton_RecentReports.css";

const Skeleton_RecentReports = () => {
  return (
    <div className="recent-reports-container skeleton-reports-wrapper">
      <div className="skeleton-title-row">
        <div className="skeleton-h3 shimmer-fast"></div>
      </div>

      <div className="skeleton-content-stack">
        {/* Placeholder for report list items */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-report-item">
            <div className="skeleton-bar-long shimmer-slow"></div>
            <div className="skeleton-bar-med shimmer-slow"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton_RecentReports;
