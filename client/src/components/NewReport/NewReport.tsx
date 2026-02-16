import React, { useRef, useState, type ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./NewReport.css";
import Toaster from "../Toaster/Toaster";
import MapComponent from "../MapComponent/MapComponent";
import { apiRequest, apiUrl } from "../../api";

type NewReportProps = {
  closeModal: () => void;
  onSuccessfulReport: (message: string) => void;
};

const NewReport = ({ closeModal, onSuccessfulReport }: NewReportProps) => {
  const { t } = useTranslation();
  const GRANADA_CENTER: [number, number] = [37.1773, -3.5986];

  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportCategory, setReportCategory] = useState<string>("");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportAddress, setReportAddress] = useState<string>("");
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [mapCoordinates, setMapCoordinates] = useState<[number, number]>([
    0, 0,
  ]);
  const [possibleAddresses, setPossibleAddresses] = useState<any[]>([]);
  const [mapZoom, setMapZoom] = useState<number>(13);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  function handleFileRefClick(type: string) {
    if (type === "camera") {
      if (cameraInputRef.current) cameraInputRef.current.click();
      return;
    }
    if (fileInputRef.current) fileInputRef.current.click();
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] ?? null;

    if (!selectedFile) return;
    if (selectedFile.type.startsWith("image/")) {
      setReportFile(selectedFile);
    } else {
      setToasterType("error");
      setToasterMessage(t("newReport.selectImageError"));
    }
  }

  async function getCoordsFromAddress() {
    const addressToSend = reportAddress.trim();
    try {
      const data = await apiRequest(
        `api/address?q=${encodeURIComponent(addressToSend)}`,
        { method: "GET" },
      );
      setPossibleAddresses(data.locations);
    } catch (e) {
      console.error("Error in getting coords from address", e);
    }
  }

  async function addReport(e: React.FormEvent) {
    e.preventDefault();
    if (
      reportTitle === "" ||
      reportCategory === "" ||
      reportDescription === ""
    ) {
      setToasterType("error");
      setToasterMessage(t("newReport.allFieldsRequired"));
      return;
    }
    const trimmedTitle = reportTitle.trim();
    const trimmedCategory = reportCategory.trim();
    const trimmedDescription = reportDescription.trim();

    const formData = new FormData();
    formData.append("title", trimmedTitle);
    formData.append("category", trimmedCategory);
    formData.append("description", trimmedDescription);

    if (reportFile) formData.append("image", reportFile);

    formData.append("lat", String(mapCoordinates[0]));
    formData.append("lon", String(mapCoordinates[1]));

    try {
      const data = await apiRequest("reports/new", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      onSuccessfulReport(t(`newReport.messages.${data.code}`));
    } catch (e) {
      console.error("Error in adding report", e);
      setToasterType("error");
      setToasterMessage(t("newReport.messages.REPORT_ERROR"));
    }
  }

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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCoordinates([pos.coords.latitude, pos.coords.longitude]),
      () => setMapCoordinates(GRANADA_CENTER),
      { timeout: 5000 },
    );
  }, []);

  useEffect(() => {
    if (!reportAddress.trim()) return;
    const timer = setTimeout(() => getCoordsFromAddress(), 1000);
    return () => clearTimeout(timer);
  }, [reportAddress]);

  return (
    <>
      {toasterMessage && (
        <Toaster
          message={toasterMessage}
          type={toasterType}
          isLeaving={toasterLeaving}
        />
      )}
      <div className="new-report-background" onClick={closeModal}>
        <div
          className="new-report-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <h2>{t("newReport.title")}</h2>
            <h3>{t("newReport.subtitle")}</h3>
          </div>
          <div className="close-icon-container" onClick={closeModal}>
            <img src="/images/close-icon.svg" alt={t("newReport.closeAlt")} />
          </div>
          <div className="inner-new-report-container">
            <form onSubmit={addReport}>
              <div className="left-side">
                <div>
                  <p>{t("newReport.labelTitle")}</p>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <p>{t("newReport.labelCategory")}</p>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    required
                  >
                    <option disabled value="">
                      {t("newReport.selectCategory")}
                    </option>
                    <option value="road">{t("newReport.category.road")}</option>
                    <option value="lighting">
                      {t("newReport.category.lighting")}
                    </option>
                    <option value="hygiene">
                      {t("newReport.category.hygiene")}
                    </option>
                    <option value="furniture">
                      {t("newReport.category.furniture")}
                    </option>
                    <option value="traffic-signs">
                      {t("newReport.category.trafficSigns")}
                    </option>
                    <option value="parks">
                      {t("newReport.category.parks")}
                    </option>
                  </select>
                </div>
                <div>
                  <p>{t("newReport.labelDescription")}</p>
                  <textarea
                    rows={5}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="file-input-container">
                  <button
                    type="button"
                    onClick={() => handleFileRefClick("file")}
                  >
                    {t("newReport.attachFile")}
                  </button>
                  <button
                    className="new-report-camera-button"
                    type="button"
                    onClick={() => handleFileRefClick("camera")}
                  >
                    {t("newReport.takePicture")}
                  </button>
                  {reportFile ? (
                    <p>
                      {t("newReport.selectedFile")}: {reportFile.name}
                    </p>
                  ) : (
                    <p>{t("newReport.noFile")}</p>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/webp, image/png"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/webp, image/png"
                  capture="environment"
                />
              </div>

              <div className="right-side">
                <div className="address-container">
                  <h3>{t("newReport.addressInstructions")}</h3>
                  <p>{t("newReport.labelAddress")}</p>
                  <input
                    type="text"
                    value={reportAddress}
                    onChange={(e) => {
                      setReportAddress(e.target.value);
                      setPossibleAddresses([]);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="address-input"
                  />

                  {showDropdown && possibleAddresses.length > 0 && (
                    <ul className="address-dropdown">
                      {possibleAddresses.map((location, i) => (
                        <li
                          key={i}
                          className="address-option"
                          onClick={() => {
                            setMapCoordinates([
                              Number(location.lat),
                              Number(location.lon),
                            ]);
                            setMapZoom(18);
                            setReportAddress(location.display_name);
                            setShowDropdown(false);
                          }}
                        >
                          {location.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div id="map" className="map-container">
                  <MapComponent
                    center={[mapCoordinates[0], mapCoordinates[1]]}
                    zoom={mapZoom}
                    onMarkerChange={(newCoords) => {
                      setMapCoordinates(newCoords);
                      setMapZoom(18);
                    }}
                    isPinDraggable={true}
                  />
                </div>

                <div className="actions">
                  <button type="button" onClick={closeModal}>
                    {t("newReport.cancel")}
                  </button>
                  <button type="submit">{t("newReport.submit")}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewReport;
