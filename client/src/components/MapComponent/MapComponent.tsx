import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { icon } from "leaflet";
import "./MapComponent.css";

interface ReportMapProps {
  center: [number, number];
  marker?: [number, number] | null;
  zoom?: number;
  onMarkerChange?: (coords: [number, number]) => void;
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
  marker,
  zoom = 13,
  onMarkerChange,
}: ReportMapProps) => {
  const [locations, setLocations] = useState<MapMarker[]>([]);
  const [currentReportIndex, setCurrentReportIndex] = useState<number>(0);
  const apiUrl: string = import.meta.env.VITE_API_URL;

  var redLocationIcon = icon({
    iconUrl: "./images/location-pin-icon.svg",
    iconSize: [28, 85], // size of the icon
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
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
    const res = await fetch(`${apiUrl}/locations`, {
      credentials: "include",
    });
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

    // Convert to array for easier use
    const groupedLocations: MapMarker[] = Object.values(locationMap);
    console.log(groupedLocations);
    setLocations(groupedLocations);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  return (
    <MapContainer
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

      {marker && (
        <Marker
          position={marker}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              if (onMarkerChange) onMarkerChange([lat, lng]);
            },
          }}
        ></Marker>
      )}
      {locations.length > 0 &&
        locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={redLocationIcon}
            eventHandlers={{
              click: () => {
                setCurrentReportIndex(0); // reset carousel
              },
            }}
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
                    onClick={() => {
                      setCurrentReportIndex(
                        (currentReportIndex - 1 + location.reports.length) %
                          location.reports.length
                      );
                    }}
                  >
                    <img src="images/map-merker-arrow-icon.png" alt="" />
                  </span>
                  <span
                    onClick={() => {
                      setCurrentReportIndex(
                        (currentReportIndex + 1) % location.reports.length
                      );
                    }}
                  >
                    <img src="images/map-merker-arrow-icon.png" alt="" />
                  </span>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapComponent;
