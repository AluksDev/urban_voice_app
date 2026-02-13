import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import { icon } from "leaflet";
import "./MapComponent.css";
import { apiUrl, apiRequest } from "../../api";
import ReportDetails from "../ReportDetails/ReportDetails";

interface ReportMapProps {
  center: [number, number];
  zoom?: number;
  onMarkerChange?: (coords: [number, number]) => void;
  isPinDraggable: boolean;
  singleMarker?: boolean;
}

interface RawLocationData {
  id: number;
  latitude: string;
  longitude: string;
  title: string;
  description: string;
}

interface PartialReport {
  id: number;
  title: string;
  description: string;
}

interface Report {
  id: number;
  user_id: number;
  location_id: number;
  title: string;
  description: string;
  category: string;
  photo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MapMarker {
  id: number;
  latitude: number;
  longitude: number;
  reports: PartialReport[];
}

type ReportPopupContentProps = {
  reports: PartialReport[];
};

const MapComponent = ({
  center,
  zoom = 13,
  onMarkerChange,
  isPinDraggable,
  singleMarker,
}: ReportMapProps) => {
  const [locations, setLocations] = useState<MapMarker[]>([]);
  const [droppedMarker, setDroppedMarker] = useState<[number, number] | null>(
    null,
  );
  const [isMobile, setIsMobile] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  function checkMobile() {
    setIsMobile(window.innerWidth < 768);
  }
  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mapRef = useRef<any>(null);

  function MapClickHandler({
    isMobile,
    onMapClick,
  }: {
    isMobile: boolean;
    onMapClick: (latlng: [number, number]) => void;
  }) {
    useMapEvent("click", (e) => {
      if (isMobile) {
        const { lat, lng } = e.latlng;
        onMapClick([lat, lng]);
      }
    });

    return null; // This component doesn't render anything
  }

  const redLocationIcon = icon({
    iconUrl: "./images/location-pin-icon.svg",
    iconSize: [28, 85],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
  });

  function ChangeView({
    center,
    zoom,
  }: {
    center: [number, number];
    zoom: number;
  }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
  }

  async function loadLocations() {
    const res = await fetch(`${apiUrl}/locations`, { credentials: "include" });
    if (!res.ok) throw new Error("Error in response");
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const rawData: RawLocationData[] = data.locations;
    const locationMap: { [key: number]: MapMarker } = {};

    rawData.forEach((item) => {
      const locId = item.id;
      if (!locationMap[locId]) {
        locationMap[locId] = {
          id: locId,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          reports: [],
        };
      }
      locationMap[locId].reports.push({
        id: item.id,
        title: item.title,
        description: item.description,
      });
    });

    setLocations(Object.values(locationMap));
  }

  useEffect(() => {
    loadLocations();
  }, []);

  // Drag and drop floating pin
  useEffect(() => {
    const mapContainer = mapRef.current?.getContainer();
    if (!isPinDraggable) return;
    if (!mapContainer) return;

    function handleDrop(e: DragEvent) {
      e.preventDefault();
      if (!mapRef.current) return;

      const bounds = mapContainer.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      const latlng = mapRef.current.containerPointToLatLng([x, y]);
      setDroppedMarker([latlng.lat, latlng.lng]);
      if (onMarkerChange) onMarkerChange([latlng.lat, latlng.lng]);
    }

    const handleDragOver = (e: DragEvent) => e.preventDefault();

    mapContainer.addEventListener("drop", handleDrop);
    mapContainer.addEventListener("dragover", handleDragOver);

    return () => {
      mapContainer.removeEventListener("drop", handleDrop);
      mapContainer.removeEventListener("dragover", handleDragOver);
    };
  }, [onMarkerChange, isPinDraggable]);

  function ReportPopupContent({ reports }: ReportPopupContentProps) {
    const [currentReportIndex, setCurrentReportIndex] = React.useState(0);
    const currentReport = reports[currentReportIndex];

    async function handlePopUpClick() {
      const data = await apiRequest(`reports/${currentReport.id}`, {
        method: "GET",
        credentials: "include",
      });
      setSelectedReport(data.report);
      setShowReportDetails(true);
    }

    return (
      <div onClick={handlePopUpClick}>
        <h4>Reports at this location:</h4>
        <div className="reports-list-container">
          <h3>{currentReport.title}</h3>
          <p>{currentReport.description}</p>
        </div>

        {reports.length > 1 && (
          <div className="map-marker-buttons-container">
            <span
              onClick={() =>
                setCurrentReportIndex(
                  (currentReportIndex - 1 + reports.length) % reports.length,
                )
              }
            >
              <img src="images/map-merker-arrow-icon.png" alt="" />
            </span>
            <span
              onClick={() =>
                setCurrentReportIndex((currentReportIndex + 1) % reports.length)
              }
            >
              <img src="images/map-merker-arrow-icon.png" alt="" />
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="map-container"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      {showReportDetails && (
        <ReportDetails
          report={selectedReport}
          closeDetailsWindow={() => setShowReportDetails(false)}
        />
      )}
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dropped marker */}
        {droppedMarker && (
          <Marker
            position={droppedMarker}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setDroppedMarker([lat, lng]);
                if (onMarkerChange) onMarkerChange([lat, lng]);
              },
            }}
          />
        )}
        <MapClickHandler
          isMobile={isMobile}
          onMapClick={(coords) => {
            setDroppedMarker(coords);
            if (onMarkerChange) onMarkerChange(coords);
          }}
        />
        {!singleMarker ? (
          locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={redLocationIcon}
            >
              <Popup>
                <ReportPopupContent reports={location.reports} />
              </Popup>
            </Marker>
          ))
        ) : (
          <Marker position={center} icon={redLocationIcon} />
        )}
      </MapContainer>

      {/* Floating corner pin */}
      {isPinDraggable && !isMobile && (
        <img
          src="./images/user-location-icon.png"
          draggable
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 40,
            cursor: "grab",
            zIndex: 1000,
          }}
          onDragStart={(e) =>
            e.dataTransfer.setData("text/plain", "new-marker")
          }
        />
      )}
    </div>
  );
};

export default MapComponent;
