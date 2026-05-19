import { useState, useMemo, useRef, useEffect, memo } from "react";

function AssigneedAvatar({ user, hideOption, checked, setChecked }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate initials
  const initials = useMemo(() => {
    if (!user?.name) return "";

    const parts = user.name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (
      parts[0][0].toUpperCase() +
      parts[parts.length - 1][0].toUpperCase()
    );
  }, [user]);

  // Stable color
  const avatarColor = useMemo(() => {
    if (!user?.name) return "#6C757D"; // default gray

    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#556270",
      "#C44D58",
      "#6C5CE7",
      "#00B894",
      "#F39C12",
      "#0984E3",
    ];

    let hash = 0;
    for (let i = 0; i < user.name.length; i++) {
      hash = user.name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }, [user]);

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Avatar */}
      <div
      title={checked?user?.name:''}
        onClick={() => setOpen(!open)}
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: "30px",
          height: "30px",
          backgroundColor: user?.name && checked ? avatarColor : "#E9ECEF",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "12px",
        }}
      >
        {checked&&user?.name ? (
          initials
        ) : (
          <i className="bi bi-person-fill text-secondary"></i>
        )}
      </div>

      {/* Dropdown */}
      {open && !hideOption &&(
        <div
          className="card position-absolute mt-2 p-3"
          style={{
            left: 0,
            minWidth: "max-content",
            zIndex: 1000,
          }}
        >
          <div className="form-check d-flex align-items-center">
            <input
              className="form-check-input"
              type="checkbox"
              id="assignedToMe"
              checked={checked}
              onChange={(e) => {setChecked(e.target.checked); setOpen(false)}}
            />
            <label className="form-check-label" htmlFor="assignedToMe">
              <div className="d-flex flex-row align-items-center">
              <span
      title={user?.name}
        onClick={() => setOpen(!open)}
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: "30px",
          height: "30px",
          backgroundColor: user?.name ? avatarColor : "#E9ECEF",
          cursor: "pointer",
          userSelect: "none",
          fontSize: "12px",
        }}
      >
        {user?.name ? (
          initials
        ) : (
          <i className="bi bi-person-fill text-secondary"></i>
        )}
       
      </span>
      <span className="mx-2"> {user?.name} (Assigned to Me)</span>
      </div>
            {/* <i class="bi bi-person-circle text-secondary" style={{background:avatarColor}}>{initials}</i>  */}
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(AssigneedAvatar);