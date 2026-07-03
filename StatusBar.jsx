export default function StatusBar({ locationEnabled }) {
  return (
    <div className="status-bar">
      <span>
        📍 Location: {locationEnabled ? "Detected" : "Not shared"}
      </span>
      <span>⚠ Severity: —</span>
    </div>
  );
}
