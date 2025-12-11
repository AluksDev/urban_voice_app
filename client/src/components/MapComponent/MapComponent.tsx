import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { icon } from "leaflet";
import "./MapComponent.css";

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

interface Report {
  title: string;
  description: string;
}

interface MapMarker {
  id: number;
  latitude: number;
  longitude: number;
  reports: Report[];
}

const MapComponent = ({
  center,
  zoom = 13,
  onMarkerChange,
  isPinDraggable,
  singleMarker,
}: ReportMapProps) => {
  const [locations, setLocations] = useState<MapMarker[]>([]);
  const [currentReportIndex, setCurrentReportIndex] = useState<number>(0);
  const [droppedMarker, setDroppedMarker] = useState<[number, number] | null>(
    null
  );
  const apiUrl: string = import.meta.env.VITE_API_URL;

  const mapRef = useRef<any>(null);

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

  const loadLocations = async () => {
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
        title: item.title,
        description: item.description,
      });
    });

    setLocations(Object.values(locationMap));
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Drag and drop floating pin
  useEffect(() => {
    const mapContainer = mapRef.current?.getContainer();
    if (!isPinDraggable) return;
    if (!mapContainer) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!mapRef.current) return;

      const bounds = mapContainer.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;

      const latlng = mapRef.current.containerPointToLatLng([x, y]);
      setDroppedMarker([latlng.lat, latlng.lng]);
      if (onMarkerChange) onMarkerChange([latlng.lat, latlng.lng]);
    };

    const handleDragOver = (e: DragEvent) => e.preventDefault();

    mapContainer.addEventListener("drop", handleDrop);
    mapContainer.addEventListener("dragover", handleDragOver);

    return () => {
      mapContainer.removeEventListener("drop", handleDrop);
      mapContainer.removeEventListener("dragover", handleDragOver);
    };
  }, [onMarkerChange, isPinDraggable]);

  return (
    <div
      id="map-container"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
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
        {!singleMarker ? (
          locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={redLocationIcon}
              eventHandlers={{ click: () => setCurrentReportIndex(0) }}
            >
              <Popup>
                <h4>Reports at this location:</h4>

                {location.reports.map(
                  (report, index) =>
                    currentReportIndex === index && (
                      <div key={index} className="reports-list-container">
                        <h3>{report.title}</h3>
                        <p>{report.description}</p>
                      </div>
                    )
                )}

                {location.reports.length > 1 && (
                  <div className="map-marker-buttons-container">
                    <span
                      onClick={() =>
                        setCurrentReportIndex(
                          (currentReportIndex - 1 + location.reports.length) %
                            location.reports.length
                        )
                      }
                    >
                      <img src="images/map-merker-arrow-icon.png" alt="" />
                    </span>
                    <span
                      onClick={() =>
                        setCurrentReportIndex(
                          (currentReportIndex + 1) % location.reports.length
                        )
                      }
                    >
                      <img src="images/map-merker-arrow-icon.png" alt="" />
                    </span>
                  </div>
                )}
              </Popup>
            </Marker>
          ))
        ) : (
          <Marker position={center} icon={redLocationIcon} />
        )}
      </MapContainer>

      {/* Floating corner pin */}
      {isPinDraggable && (
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
