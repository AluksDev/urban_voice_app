import "./ReportDetails.css";
import MapComponent from "../MapComponent/MapComponent";
import { useEffect, useRef, useState } from "react";
import Toaster from "../Toaster/Toaster";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [locationCoordinates, setLocationCoordinates] = useState<
    [number, number]
  >([0, 0]);
  const [newTitle, setNewTitle] = useState<string>(report?.title || "");
  const [newCategory, setNewCategory] = useState<string>(
    report?.category || ""
  );
  const [newDescription, setNewDescription] = useState<string>(
    report?.description || ""
  );
  const [newStatus, setNewStatus] = useState<string>(report?.status || "");
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const apiUrl: string = import.meta.env.VITE_API_URL;
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { key: "road", label: t("reportDetails.categories.road") },
    { key: "lighting", label: t("reportDetails.categories.lighting") },
    { key: "hygiene", label: t("reportDetails.categories.hygiene") },
    { key: "furniture", label: t("reportDetails.categories.furniture") },
    {
      key: "traffic-signs",
      label: t("reportDetails.categories.traffic-signs"),
    },
    { key: "parks", label: t("reportDetails.categories.parks") },
  ];

  const getReportLocation = async () => {
    try {
      const res = await fetch(`${apiUrl}/locations/${report?.location_id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error in response");
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setLocationCoordinates([data.latitude, data.longitude]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageZoom = (type: string) => {
    if (!imageContainerRef.current) return;
    if (type === "out") {
      imageContainerRef.current.classList.remove("zoomed");
    } else {
      imageContainerRef.current.classList.add("zoomed");
    }
  };

  const handleDetailsChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      setToasterMessage(t("reportDetails.errors.EMPTY_TITLE"));
      setToasterType("error");
      return;
    }

    if (!newDescription.trim()) {
      setToasterMessage(t("reportDetails.errors.EMPTY_DESCRIPTION"));
      setToasterType("error");
      return;
    }

    if (!newCategory) {
      setToasterMessage(t("reportDetails.errors.EMPTY_CATEGORY"));
      setToasterType("error");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/reports/edit`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          reportId: report?.id,
          newTitle: newTitle.trim(),
          newCategory,
          newDescription: newDescription.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setToasterType("error");
        setToasterMessage(t(`reportDetails.messages.${data.code}`));
        setToasterLeaving(true);
        return;
      }

      setToasterType("success");
      setToasterMessage(t(`reportDetails.messages.${data.code}`));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!report?.location_id) return;
    getReportLocation();
  }, []);

  useEffect(() => {
    if (!toasterMessage) return;
    const leaveTimer = setTimeout(() => setToasterLeaving(true), 3000);
    const removeTimer = setTimeout(() => {
      setToasterMessage("");
      setToasterLeaving(false);
    }, 3300);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toasterMessage]);

  return (
    <div className="report-details-container" onClick={closeDetailsWindow}>
      {toasterMessage && (
        <Toaster
          message={toasterMessage}
          type={toasterType}
          isLeaving={toasterLeaving}
        />
      )}

      <div
        className="report-details-inner"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="zoomed-image-container" ref={imageContainerRef}>
          <img
            src={report?.photo_url}
            alt=""
            onClick={() => handleImageZoom("out")}
          />
        </div>

        <div
          className="report-details-close-icon-container"
          onClick={closeDetailsWindow}
        >
          <img src="/images/close-icon.svg" alt="close icon" />
        </div>

        <div className="report-details-left">
          <form
            className="editable-details-container"
            onSubmit={handleDetailsChange}
          >
            <div>
              <p>{t("reportDetails.title")}</p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <p>{t("reportDetails.category")}</p>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p>{t("reportDetails.description")}</p>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />
            </div>

            <div className="editable-details-button-container">
              <button
                type="button"
                onClick={() => {
                  setNewTitle(report?.title || "");
                  setNewCategory(report?.category || "");
                  setNewDescription(report?.description || "");
                }}
              >
                {t("reportDetails.cancel")}
              </button>
              <button type="submit">{t("reportDetails.saveChanges")}</button>
            </div>
          </form>

          <div className="non-editable-details-container">
            <div>
              <p>{t("reportDetails.status")}</p>
              <input
                type="text"
                readOnly
                value={
                  newStatus ? t(`reportDetails.statuses.${newStatus}`) : ""
                }
                disabled
              />
            </div>

            <div>
              <p>{t("reportDetails.created")}</p>
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
                disabled
              />
            </div>

            <div>
              <p>{t("reportDetails.lastUpdated")}</p>
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
                disabled
              />
            </div>
          </div>
        </div>

        <div className="report-details-right">
          <div className="report-details-image-container">
            <img
              src={report?.photo_url}
              alt=""
              onClick={() => handleImageZoom("in")}
            />
          </div>

          <div className="user-details-map-container">
            <MapComponent
              center={locationCoordinates}
              isPinDraggable={false}
              singleMarker
              zoom={17}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
