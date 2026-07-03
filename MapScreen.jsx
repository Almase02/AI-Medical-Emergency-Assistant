import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Auto center map smoothly
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 16, { animate: true });
  return null;
}

export default function MapScreen({ onBack }) {
  const [current, setCurrent] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [destText, setDestText] = useState("");
  const [status, setStatus] = useState("📡 Detecting location...");

  // 🔥 LIVE TRACKING
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];

        setCurrent(coords);
        setAccuracy(pos.coords.accuracy);

        if (pos.coords.accuracy < 50) {
          setStatus("📍 High accuracy location");
        } else {
          setStatus("⚠ Low accuracy (move or use mobile)");
        }
      },
      () => {
        setStatus("⚠ Location blocked → enable GPS");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 🔍 SEARCH
  const searchDestination = async () => {
    if (!destText) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${destText}`
    );
    const data = await res.json();

    if (data.length > 0) {
      const coords = [
        parseFloat(data[0].lat),
        parseFloat(data[0].lon),
      ];
      setDestination(coords);
      getRoute(coords);
    }
  };

  // 🏥 NEARBY
  const fetchNearby = async (type) => {
    if (!current) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${type}&limit=1`
    );
    const data = await res.json();

    if (data.length > 0) {
      const coords = [
        parseFloat(data[0].lat),
        parseFloat(data[0].lon),
      ];
      setDestination(coords);
      getRoute(coords);
    }
  };

  // 🧭 ROUTE
  const getRoute = async (destCoords) => {
    if (!current || !destCoords) return;

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${current[1]},${current[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`
    );

    const data = await res.json();

    const coords = data.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    setRoute(coords);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{
        background: "#111827",
        color: "white",
        padding: "10px",
        display: "flex",
        gap: "10px"
      }}>
        <button onClick={onBack}>⬅ Back</button>
        <strong>🗺️ Emergency Map</strong>
      </div>

      {/* CONTROLS */}
      <div style={{ padding: "10px", background: "#f3f4f6" }}>

        <div>{status}</div>

        {/* DESTINATION */}
        <input
          placeholder="Search hospital / police / fire"
          value={destText}
          onChange={(e) => setDestText(e.target.value)}
          style={{ width: "100%", padding: "8px", marginTop: "8px" }}
        />

        <button onClick={searchDestination}>
          Search
        </button>

        {/* QUICK BUTTONS */}
        <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
          <button onClick={() => fetchNearby("hospital")}>🏥</button>
          <button onClick={() => fetchNearby("police")}>🚓</button>
          <button onClick={() => fetchNearby("fire station")}>🔥</button>
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex: 1 }}>
        {current ? (
          <MapContainer center={current} zoom={16} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <ChangeView center={current} />

            {/* CURRENT LOCATION */}
            <Marker position={current}>
              <Popup>📍 You are here</Popup>
            </Marker>

            {/* 🔵 ACCURACY CIRCLE */}
            <Circle
              center={current}
              radius={accuracy}
              pathOptions={{ color: "blue", fillOpacity: 0.1 }}
            />

            {/* DESTINATION */}
            {destination && (
              <Marker position={destination}>
                <Popup>🚑 Destination</Popup>
              </Marker>
            )}

            {/* ROUTE */}
            {route.length > 0 && (
              <Polyline positions={route} color="blue" />
            )}
          </MapContainer>
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Detecting location...
          </div>
        )}
      </div>
    </div>
  );
}