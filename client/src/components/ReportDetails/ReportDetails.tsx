import "./ReportDetails.css";
import MapComponent from "../MapComponent/MapComponent";
import { useEffect, useState } from "react";

interface Report {
  id: number;
  user_id: number;
  location_id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

interface ReportDetailsProps {
  closeDetailsWindow: () => void;
  report: Report | null;
}

const ReportDetails = ({ closeDetailsWindow, report }: ReportDetailsProps) => {
  const [locationCoordinates, setLocationCoordinates] = useState<
    [number, number]
  >([0, 0]);
  const apiUrl: string = import.meta.env.VITE_API_URL;

  const getReportLocation = async () => {
    try {
      const res = await fetch(`${apiUrl}/locations/${report?.location_id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error in response");
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      setLocationCoordinates([data.latitude, data.longitude]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!report?.location_id) return;
    getReportLocation();
  }, []);

  return (
    <div className={`report-details-container`} onClick={closeDetailsWindow}>
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
          </div>
          <div>
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
        </div>
        <div className="report-details-right">
          <div className="report-details-image-container">
            <img src={report?.photo_url} alt="" />
          </div>
          <div className="user-details-map-container">
            <MapComponent
              center={locationCoordinates}
              isPinDraggable={false}
              singleMarker={true}
              zoom={17}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
