import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

interface ReportMapProps {
  center: [number, number];
  marker?: [number, number] | null;
  zoom?: number;
}

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

const MapComponent = ({ center, marker, zoom = 13 }: ReportMapProps) => {
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
        <Marker position={marker}>
          <Popup>Selected location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;
