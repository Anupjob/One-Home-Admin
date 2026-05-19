import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const showLoader = () => {
  const el = document.getElementById("global-loader");
  if (el) el.style.display = "flex";
};

export const hideLoader = () => {
  const el = document.getElementById("global-loader");
  if (el) el.style.display = "none";
};

function RouteChangeLoader() {
  const location = useLocation();

  useEffect(() => {
    // Trigger loader whenever the route changes
    showLoader();
    const timer = setTimeout(() => hideLoader(), 500);

    return () => clearTimeout(timer);
  }, [location]); // runs whenever the URL changes

  return null; // invisible component
}

export default RouteChangeLoader;
