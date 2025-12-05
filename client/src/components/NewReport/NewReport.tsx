import React, { useRef, useState, type ChangeEvent, useEffect } from "react";
import "./NewReport.css";
import Toaster from "../Toaster/Toaster";
import MapComponent from "../MapComponent/MapComponent";

type NewReportProps = {
  closeModal: () => void;
  onSuccessfulReport: (message: string) => void;
};
const NewReport = ({ closeModal, onSuccessfulReport }: NewReportProps) => {
  const GRANADA_CENTER: [number, number] = [37.1773, -3.5986]; // Used for fallback on getting initial coords

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
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleFileRefClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  const apiUrl: string = import.meta.env.VITE_API_URL;

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

  const getCoordsFromAddress = async () => {
    const addressToSend = reportAddress.trim();
    try {
      const res = await fetch(
        `${apiUrl}/api/address?q=${encodeURIComponent(addressToSend)}`
      );
      if (!res.ok) {
        throw new Error("Request failed");
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error("Error in fetching data");
      }
      setPossibleAddresses(data.locations);
    } catch (e) {
      console.error("Error in getting coords from address", e);
    }
  };

  const addReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportTitle == "" || reportCategory == "" || reportDescription == "") {
      setToasterType("error");
      setToasterMessage("All fields are required");
      return;
    }
    const trimmedTitle = reportTitle.trim();
    const trimmedCategory = reportCategory.trim();
    const trimmedDescription = reportDescription.trim();

    const formData = new FormData();
    formData.append("title", trimmedTitle);
    formData.append("category", trimmedCategory);
    formData.append("description", trimmedDescription);

    if (reportFile) {
      formData.append("image", reportFile);
    }

    formData.append("lat", String(mapCoordinates[0]));
    formData.append("lon", String(mapCoordinates[1]));

    try {
      const res = await fetch(`${apiUrl}/reports/new`, {
        credentials: "include",
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Error in response");
      }
      const data = await res.json();
      if (data.success == false) {
        setToasterMessage(data.message);
        setToasterType("error");
      } else {
        onSuccessfulReport(data.message);
      }
    } catch (e) {
      console.error("Error in adding report", e);
      setToasterType("error");
      setToasterMessage("An error occurred");
    }
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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapCoordinates([latitude, longitude]);
      },
      () => {
        setMapCoordinates(GRANADA_CENTER);
      },
      { timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    if (reportAddress.trim() === "") return;
    const timer = setTimeout(() => {
      getCoordsFromAddress();
    }, 1000);
    return () => clearTimeout(timer);
  }, [reportAddress]);

  return (
    <div className="new-report-background" onClick={closeModal}>
      <div
        className="new-report-container"
        onClick={(e) => e.stopPropagation()}
      >
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
              <div>
                <p>Title</p>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <p>Category</p>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  required
                >
                  <option disabled value="">
                    -- Select category --
                  </option>
                  <option value="road">Road Damage (potholes, cracks)</option>
                  <option value="lighting">
                    Street Lighting (broken lamps)
                  </option>
                  <option value="hygiene">
                    Cleanliness (litter, dog waste)
                  </option>
                  <option value="furniture">
                    Public Furniture (benches, tables, bins)
                  </option>
                  <option value="traffic-signs">Signs & Traffic Signals</option>
                  <option value="parks">Parks & Green Spaces</option>
                </select>
              </div>
              <div>
                <p>Description</p>
                <textarea
                  rows={5}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="file-input-container">
                <button type="button" onClick={handleFileRefClick}>
                  Attach File
                </button>
                {reportFile ? (
                  <p>Selected file: {reportFile.name}</p>
                ) : (
                  <p>No Files Attached</p>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <div className="right-side">
              <div className="address-container">
                <p>Address</p>
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
                  marker={[mapCoordinates[0], mapCoordinates[1]]}
                  zoom={mapZoom}
                  onMarkerChange={(newCoords) => {
                    setMapCoordinates(newCoords);
                    setMapZoom(18);
                  }}
                />
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
