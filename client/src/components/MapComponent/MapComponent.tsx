import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { icon } from "leaflet";

interface ReportMapProps {
  center: [number, number];
  marker?: [number, number] | null;
  zoom?: number;
  onMarkerChange?: (coords: [number, number]) => void;
}

const MapComponent = ({
  center,
  marker,
  zoom = 13,
  onMarkerChange,
}: ReportMapProps) => {
  const [locations, setLocations] = useState<any[]>([]);
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

  useEffect(() => {
    const loadLocations = async () => {
      const res = await fetch(`${apiUrl}/locations`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error in response");
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setLocations(data.locations);
    };
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
        >
          <Popup>Selected location</Popup>
        </Marker>
      )}
      {locations.length > 0 &&
        locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={redLocationIcon}
          ></Marker>
        ))}
    </MapContainer>
  );
};

export default MapComponent;
