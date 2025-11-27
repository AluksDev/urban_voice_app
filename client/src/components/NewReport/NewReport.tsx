import React, { useRef, useState, type ChangeEvent, useEffect } from "react";
import "./NewReport.css";
import Toaster from "../Toaster/Toaster";
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from "react-leaflet";

interface Location {
  lat: number | null;
  lon: number | null;
  address: string;
}

type NewReportProps = {
  closeModal: () => void;
};
const NewReport = ({ closeModal }: NewReportProps) => {
  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportCategory, setReportCategory] = useState<string>("");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [toasterMessage, setToasterMessage] = useState<string>("");
  const [toasterType, setToasterType] = useState<string>("success");
  const [toasterLeaving, setToasterLeaving] = useState<boolean>(false);
  const [reportLocation, setReportLocation] = useState<Location>({
    lat: null,
    lon: null,
    address: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileRefClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;

    if (!selectedFile) return;
    if (selectedFile.type.startsWith("image/")) {
      setReportFile(selectedFile);
    } else {
      setToasterType("error");
      setToasterMessage("Please select an image");
    }
  };

  const addReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = reportTitle.trim();
    const trimmedCategory = reportCategory.trim();
    const trimmedDescription = reportDescription.trim();
  };

  useEffect(() => {
    if (toasterMessage === "") return;

    const leaveTimer = setTimeout(() => {
      setToasterLeaving(true);
    }, 3000); // toast visible for 3s

    const removeTimer = setTimeout(() => {
      setToasterMessage("");
      setToasterLeaving(false); // reset for next toast
    }, 3300); // 3000 + 300ms animation

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toasterMessage]);

  return (
    <div className="new-report-background">
      <div className="new-report-container">
        {toasterMessage != "" && (
          <Toaster
            message={toasterMessage}
            type={toasterType}
            isLeaving={toasterLeaving}
          />
        )}
        <div>
          <h2>New Report</h2>
          <h3>Please fill out the details below to submit a form</h3>
        </div>
        <div className="close-icon-container" onClick={closeModal}>
          <img src="/images/close-icon.svg" alt="close icon" />
        </div>
        <div className="inner-new-report-container">
          <form onSubmit={addReport}>
            <div className="left-side">
              <input
                type="text"
                placeholder="Title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
              >
                <option disabled value="">
                  -- Select category --
                </option>
                <option value="road">Road Damage (potholes, cracks)</option>
                <option value="lighting">Street Lighting (broken lamps)</option>
                <option value="hygiene">Cleanliness (litter, dog waste)</option>
                <option value="furniture">
                  Public Furniture (benches, tables, bins)
                </option>
                <option value="traffic-signs">Signs & Traffic Signals</option>
                <option value="parks">Parks & Green Spaces</option>
              </select>

              <textarea
                placeholder="Description"
                rows={5}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              ></textarea>

              <button type="button" onClick={handleFileRefClick}>
                Attach File
              </button>
              {reportFile ? (
                <p>Selected file: {reportFile.name}</p>
              ) : (
                <p>No Files Attached</p>
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <div className="right-side">
              <div id="map" className="map-container">
                <MapContainer
                  center={[51.505, -0.09]}
                  zoom={13}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[51.505, -0.09]}>
                    <Popup>
                      A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="actions">
                <button type="button">Cancel</button>
                <button type="submit">Submit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewReport;
