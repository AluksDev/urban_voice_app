import React, { useEffect, useState } from "react";
import MapComponent from "../../components/MapComponent/MapComponent";
import "./Map.css";

const Map = () => {
  const GRANADA_CENTER: [number, number] = [37.1773, -3.5986]; // Used for fallback on getting initial coords

  const [mapCoordinates, setMapCoordinates] = useState<[number, number]>([
    0, 0,
  ]);

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
  return (
    <div id="map" className="map-page-container">
      <MapComponent center={[mapCoordinates[0], mapCoordinates[1]]} zoom={10} />
    </div>
  );
};

export default Map;
