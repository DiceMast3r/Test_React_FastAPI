import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function App() {
  const [locations, setLocations] = useState([]); // Array of locations
  const [formData, setFormData] = useState({
    departure: "",
    destination: "",
    time: new Date().toISOString().slice(0, 16), // Default to current UTC time
  });
  const [fetching, setFetching] = useState(false); // State to manage fetching

  useEffect(() => {
    // Fetch multiple locations from FastAPI
    axios
      .get("http://127.0.0.1:8000/locations") // Replace with your FastAPI endpoint
      .then((response) => {
        setLocations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
      });
  }, []);

  // Generate an array of [lat, lon] for Polyline
  const polylinePositions = locations.map((location) => [
    location.latitude,
    location.longitude,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value.toUpperCase(), // Convert input to uppercase
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:8000/submit", formData) // Replace with your FastAPI endpoint
      .then((response) => {
        console.log("Data submitted successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error submitting data:", error);
      });
  };

  const handleFetchLocations = () => {
    setFetching(true);
    axios
      .get("http://127.0.0.1:8000/locations") // Replace with your FastAPI endpoint
      .then((response) => {
        setLocations(response.data);
        setFetching(false);
      })
      .catch((error) => {
        console.error("Error fetching locations:", error);
        setFetching(false);
      });
  };

  const handleClearLocations = () => {
    setLocations([]);
  };

  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          maxWidth: "300px",
          fontFamily: "'Arial', sans-serif",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Departure Airport:</label>
          <input
            type="text"
            name="departure"
            value={formData.departure}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Destination Airport:</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Time of Departure:</label>
          <input
            type="datetime-local"
            name="time"
            value={formData.time}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            background: "#007bff",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
        <button
          onClick={handleFetchLocations}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            background: "#28a745",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {fetching ? "Fetching..." : "Fetch Locations"}
        </button>
        <button
          onClick={handleClearLocations}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            background: "#dc3545",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </form>
      <MapContainer center={[9.503243879785233, 102.83203125]} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <strong>{location.name}</strong>
              <br />
              Latitude: {location.latitude.toFixed(5)}
              <br />
              Longitude: {location.longitude.toFixed(5)}
            </Popup>
          </Marker>
        ))}

        {/* Draw polyline connecting all waypoints */}
        <Polyline positions={polylinePositions} color="red" />
      </MapContainer>
    </div>
  );
}

export default App;
