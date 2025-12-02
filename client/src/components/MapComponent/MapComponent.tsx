import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

interface ReportMapProps {
  center: [number, number];
  marker?: [number, number] | null;
  zoom?: number;
  onMarkerChange?: (coords: [number, number]) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  const searchZoom = 18;
  map.setView(center, searchZoom);
  return null;
}

const MapComponent = ({
  center,
  marker,
  zoom = 13,
  onMarkerChange,
}: ReportMapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
    >
      <ChangeView center={center} />

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
        >
          <Popup>Selected location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;
