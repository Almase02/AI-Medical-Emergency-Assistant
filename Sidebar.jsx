export default function Sidebar() {
  return (
    <div className="sidebar">
      <button className="new-chat">＋ New Emergency</button>

      <input
        className="search"
        placeholder="Search history"
        disabled
      />

      <div className="history">
        <div className="item">Accident — Today</div>
        <div className="item">Severe Cold — Yesterday</div>
        <div className="item">Fire Alert — Jan 28</div>
      </div>
    </div>
  );
}
