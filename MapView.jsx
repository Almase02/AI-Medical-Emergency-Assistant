import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ location }) {
  if (!location) {
    return (
      <div className="map-placeholder">
        📍 Enable location to view map
      </div>
    );
  }

  return (
    <MapContainer
      center={[location.lat, location.lon]}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[location.lat, location.lon]}>
        <Popup>Your current location</Popup>
      </Marker>
    </MapContainer>
  );
}
