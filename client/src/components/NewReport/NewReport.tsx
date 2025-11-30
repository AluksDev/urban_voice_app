import React, { useRef, useState, type ChangeEvent, useEffect } from "react";
import "./NewReport.css";
import Toaster from "../Toaster/Toaster";
import MapComponent from "../MapComponent/MapComponent";
import { map } from "leaflet";

type NewReportProps = {
  closeModal: () => void;
};
const NewReport = ({ closeModal }: NewReportProps) => {
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

  const getCoordsFromAddress = async () => {
    const addressToSend = reportAddress.trim();
    try {
      const res = await fetch(
        `http://localhost:3001/api/address?q=${encodeURIComponent(
          addressToSend
        )}`
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
    const trimmedTitle = reportTitle.trim();
    const trimmedCategory = reportCategory.trim();
    const trimmedDescription = reportDescription.trim();
    const dataToSend = {
      title: trimmedTitle,
      category: trimmedCategory,
      decription: trimmedDescription,
      image: reportFile ? reportFile : null,
      location: mapCoordinates,
    };
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
                required
              />
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                required
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
                required
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
              <input
                type="text"
                value={reportAddress}
                onChange={(e) => {
                  setPossibleAddresses([]);
                  setReportAddress(e.target.value);
                }}
                placeholder="Address"
              />
              <select
                onChange={(e) => {
                  const index: number = Number(e.target.value);
                  const location = possibleAddresses[index];
                  setMapCoordinates([
                    Number(location.lat),
                    Number(location.lon),
                  ]);
                }}
              >
                <option value="">Type address above...</option>
                {possibleAddresses.length > 0 &&
                  possibleAddresses.map((location, i) => (
                    <option key={i} value={i}>
                      {location.display_name}
                    </option>
                  ))}
              </select>

              <div id="map" className="map-container">
                <MapComponent
                  center={[mapCoordinates[0], mapCoordinates[1]]}
                  marker={[mapCoordinates[0], mapCoordinates[1]]}
                  onMarkerChange={(newCoords) => {
                    setMapCoordinates(newCoords);
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
