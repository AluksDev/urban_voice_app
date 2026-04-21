import "./ReportDetails.css";
import MapComponent from "../MapComponent/MapComponent";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Toaster from "../Toaster/Toaster";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../api";

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
    report?.category || "",
  );
  const [newDescription, setNewDescription] = useState<string>(
    report?.description || "",
  );
  const [newStatus, setNewStatus] = useState<string>(report?.status || "");
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [newCoords, setNewCoords] = useState<[number, number]>([0, 0]);
  const [isLike, setIsLike] = useState<boolean>(false);
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

  async function getReportLocation() {
    try {
      const data = await apiRequest(`locations/${report?.location_id}`, {
        method: "GET",
        credentials: "include",
      });
      setLocationCoordinates([data.latitude, data.longitude]);
      setNewCoords([data.latitude, data.longitude]);
    } catch (e) {
      console.error(e);
    }
  }

  function handleImageZoom(type: string) {
    if (!imageContainerRef.current) return;
    if (type === "out") {
      imageContainerRef.current.classList.remove("zoomed");
    } else {
      imageContainerRef.current.classList.add("zoomed");
    }
  }

  function handlePhotoButtonClick(type: string) {
    if (type == "camera") {
      if (cameraRefInput.current) cameraRefInput.current.click();
      return;
    }
    if (deviceRefInput.current) deviceRefInput.current.click();
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target?.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToasterType("error");
      setToasterMessage(t("Invalid Image"));
      return;
    }
    setNewPhoto(file);
  }

  async function handleDetailsChange(e: React.FormEvent<HTMLFormElement>) {
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
    formData.append("reportId", String(report?.id));
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
      const data = await apiRequest("reports/edit", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      setToasterType("success");
      setToasterMessage(t(`reportDetails.messages.${data.code}`));
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLikeReport(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    reportId: number | undefined,
  ) {
    e.preventDefault();
    try {
      const data = await apiRequest(`reports/${reportId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (data) {
        setToasterMessage(data.code);
        setToasterType("success");
        setIsLike(data.code === "LIKE_ADDED" ? true : false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function checkReportLike() {
    try {
      const data = await apiRequest(`reports/${report?.id}/like`, {
        method: "GET",
        credentials: "include",
      });
      if (data) {
        setIsLike(data.isLiked);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!report) return;
    checkReportLike();
  }, []);

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
            <h3>
              {report?.user_id === auth.user?.id ? "Edit" : ""} Report #
              {report?.id}
            </h3>
            {isAdmin && <h4>Submitted by user ID: {report?.user_id}</h4>}
          </div>
          <div>
            <div className="report-details-left">
              <div>
                <p>{t("reportDetails.title")}</p>
                <input
                  type="text"
                  value={newTitle}
                  disabled={
                    !isPending || isAdmin || report?.user_id !== auth.user?.id
                  }
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <p>{t("reportDetails.category")}</p>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={
                    !isPending || isAdmin || report?.user_id !== auth.user?.id
                  }
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
                  disabled={
                    !isPending || isAdmin || report?.user_id !== auth.user?.id
                  }
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
                {isPending &&
                  !isAdmin &&
                  Number(report?.user_id) === Number(auth.user?.id) && (
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
                  isPinDraggable={
                    isAdmin
                      ? false
                      : isPending && report?.user_id === auth.user?.id
                  }
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
              ) : report?.user_id !== auth.user?.id ? (
                isLike ? (
                  <button
                    className="like-button unlike"
                    type="submit"
                    onClick={(e) => handleLikeReport(e, report?.id)}
                  >
                    <svg
                      width="2em"
                      height="2em"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M15.65 6.5L18.5 6.5C19.0523 6.5 19.5 6.94772 19.5 7.5L19.5 12.5C19.5 13.0523 19.0523 13.5 18.5 13.5L15.65 13.5C15.5672 13.5 15.5 13.4328 15.5 13.35L15.5 6.65C15.5 6.56716 15.5672 6.5 15.65 6.5Z"
                          stroke="#ffffff"
                          strokeLinecap="round"
                        ></path>{" "}
                        <path
                          d="M15.5 12.5L13.6056 16.2889C13.5361 16.4277 13.5 16.5808 13.5 16.7361L13.5 18.5C13.5 19.0523 13.0523 19.5 12.5 19.5V19.5C11.3954 19.5 10.5 18.6046 10.5 17.5L10.5 13.5"
                          stroke="#ffffff"
                          strokeLinecap="round"
                        ></path>{" "}
                        <path
                          d="M12.5 13.5L6.5028 13.5C5.83629 13.5 5.35632 12.8603 5.54269 12.2204L7.29019 6.22037C7.41451 5.79352 7.80571 5.5 8.2503 5.5L12.0858 5.5C12.351 5.5 12.6054 5.60536 12.7929 5.79289L13.2071 6.20711C13.3946 6.39464 13.649 6.5 13.9142 6.5L15.5 6.5"
                          stroke="#ffffff"
                          strokeLinecap="round"
                        ></path>{" "}
                      </g>
                    </svg>
                    Unlike
                  </button>
                ) : (
                  <button
                    className="like-button"
                    type="submit"
                    onClick={(e) => handleLikeReport(e, report?.id)}
                  >
                    <svg
                      width="2em"
                      height="2em"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M8.35 17.5H5.5C4.94772 17.5 4.5 17.0523 4.5 16.5V11.5C4.5 10.9477 4.94772 10.5 5.5 10.5H8.35C8.43284 10.5 8.5 10.5672 8.5 10.65V17.35C8.5 17.4328 8.43284 17.5 8.35 17.5Z"
                          stroke="#ffffff"
                          strokeLinecap="round"
                        ></path>{" "}
                        <path
                          d="M8.5 11.5L10.3944 7.71115C10.4639 7.57229 10.5 7.41918 10.5 7.26393V5.5C10.5 4.94772 10.9477 4.5 11.5 4.5V4.5C12.6046 4.5 13.5 5.39543 13.5 6.5V10.5"
                          stroke="#ffffff"
                          strokeLinecap="round"
                        ></path>{" "}
                        <path
                          d="M11.5 10.5H17.4972C18.1637 10.5 18.6437 11.1397 18.4573 11.7796L16.7098 17.7796C16.5855 18.2065 16.1943 18.5 15.7497 18.5H11.9142C11.649 18.5 11.3946 18.3946 11.2071 18.2071L10.7929 17.7929C10.6054 17.6054 10.351 17.5 10.0858 17.5H8.5"
                          stroke="#ffffff"
                          strokeLinecap="round"
                        ></path>{" "}
                      </g>
                    </svg>
                    Like
                  </button>
                )
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
                      "status-select",
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
