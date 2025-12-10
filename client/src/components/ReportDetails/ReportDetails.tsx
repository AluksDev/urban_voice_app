import "./ReportDetails.css";

interface Report {
  id: number;
  user_id: number;
  location_id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  photo_url: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

interface ReportDetailsProps {
  isOpen: boolean;
  closeDetailsWindow: () => void;
  report: Report | null;
}

const ReportDetails = ({
  isOpen,
  closeDetailsWindow,
  report,
}: ReportDetailsProps) => {
  return (
    <div
      className={`report-details-container ${isOpen ? "open" : ""}`}
      onClick={closeDetailsWindow}
    >
      <div
        className="report-details-inner"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="report-details-close-icon-container"
          onClick={closeDetailsWindow}
        >
          <img src="/images/close-icon.svg" alt="close icon" />
        </div>
        <div className="report-details-left">
          <div>
            <p>Title</p>
            <input type="text" readOnly value={report?.title} />
          </div>
          <div>
            <p>Category</p>
            <input type="text" readOnly value={report?.category} />
          </div>
          <div>
            <p>Description</p>
            <textarea readOnly value={report?.description}></textarea>
          </div>
          <div>
            <p>Status</p>
            <input type="text" readOnly value={report?.status} />
          </div>
          <div>
            <p>Created</p>
            <input
              type="text"
              readOnly
              value={
                report
                  ? new Date(report.created_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
            />
          </div>
          <div>
            <p>Last Updated</p>
            <input
              type="text"
              readOnly
              value={
                report
                  ? new Date(report.updated_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
            />
          </div>
        </div>
        <div className="report-details-right">
          <div>
            <img src="" alt="" />
          </div>
          <div>Map</div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
