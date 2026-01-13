import "./ReportDetails.css";
import MapComponent from "../MapComponent/MapComponent";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Toaster from "../Toaster/Toaster";
import { useTranslation } from "react-i18next";
import { apiUrl } from "../../api";
import { useAuth } from "../../context/AuthContext";

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
  isAdmin?: boolean;
  onStatusChange?: (reportStatus: string) => void;
}

const ReportDetails = ({
  closeDetailsWindow,
  report,
  isAdmin,
  onStatusChange,
}: ReportDetailsProps) => {
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
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [newCoords, setNewCoords] = useState<[number, number]>([0, 0]);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const cameraRefInput = useRef<HTMLInputElement>(null);
  const deviceRefInput = useRef<HTMLInputElement>(null);
  const auth = useAuth();

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
      setNewCoords([data.latitude, data.longitude]);
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

  const handlePhotoButtonClick = (type: string) => {
    if (type == "camera") {
      if (cameraRefInput.current) cameraRefInput.current.click();
      return;
    }
    if (deviceRefInput.current) deviceRefInput.current.click();
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToasterType("error");
      setToasterMessage(t("Invalid Image"));
      return;
    }
    setNewPhoto(file);
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

    const trimmedTitle = newTitle.trim();
    const trimmedDescription = newDescription.trim();
    const trimmedCategory = newCategory.trim();

    const formData = new FormData();
    formData.append("title", trimmedTitle);
    formData.append("category", trimmedCategory);
    formData.append("description", trimmedDescription);
    if (newPhoto) formData.append("image", newPhoto);
    formData.append("lat", String(newCoords![0]));
    formData.append("lon", String(newCoords![1]));

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const res = await fetch(`${apiUrl}/reports/edit`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
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
    if (report.status === "pending") {
      setIsPending(true);
    }
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

        <form
          className="editable-details-container"
          onSubmit={handleDetailsChange}
        >
          <div>
            <h3>Edit Report #{report?.id}</h3>
            <h4>Submitted by: {auth.user?.name}</h4>
          </div>
          <div>
            <div className="report-details-left">
              <div>
                <p>{t("reportDetails.title")}</p>
                <input
                  type="text"
                  value={newTitle}
                  disabled={!isPending}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <p>{t("reportDetails.category")}</p>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={!isPending}
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
                  disabled={!isPending}
                  required
                />
              </div>
              <div className="report-details-change-photo">
                <div className="report-details-image-container">
                  <img
                    src={report?.photo_url}
                    alt=""
                    onClick={() => handleImageZoom("in")}
                  />
                </div>
                {isPending && (
                  <>
                    <button
                      type="button"
                      onClick={() => handlePhotoButtonClick("device")}
                    >
                      Select New Image
                    </button>
                    <button
                      className="report-details-camera-button"
                      type="button"
                      onClick={() => handlePhotoButtonClick("camera")}
                    >
                      Take New Photo
                    </button>
                  </>
                )}
                <input
                  type="file"
                  ref={cameraRefInput}
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                  capture="environment"
                  accept="image/jpeg, image/webp, image/png"
                />
                <input
                  type="file"
                  ref={deviceRefInput}
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                  accept="image/jpeg, image/webp, image/png"
                />
              </div>
            </div>
            <div className="report-details-right">
              <div className="user-details-map-container">
                <MapComponent
                  center={locationCoordinates}
                  isPinDraggable={isPending}
                  singleMarker
                  zoom={17}
                  onMarkerChange={(coords) =>
                    setNewCoords([coords[0], coords[1]])
                  }
                />
              </div>
            </div>{" "}
          </div>
          <div className="editable-details-button-container">
            <div className="non-editable-details-container">
              <div>
                <p>{t("reportDetails.status")}</p>
                <p>
                  {newStatus ? t(`reportDetails.statuses.${newStatus}`) : ""}
                </p>
              </div>

              <div>
                <p>{t("reportDetails.created")}</p>
                <p>
                  {report
                    ? new Date(report.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </div>

              <div>
                <p>{t("reportDetails.lastUpdated")}</p>
                <p>
                  {report
                    ? new Date(report.updated_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </div>
            </div>
            {!isAdmin ? (
              isPending ? (
                <div>
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
                  <button type="submit">
                    {t("reportDetails.saveChanges")}
                  </button>
                </div>
              ) : (
                <p>Only pending reports can be edited</p>
              )
            ) : (
              <div className="admin-status-container">
                <select defaultValue={report?.status} id="status-select">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="closed">Closed</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const select = document.getElementById(
                      "status-select"
                    ) as HTMLSelectElement;
                    if (onStatusChange) onStatusChange(select.value);
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDetails;
