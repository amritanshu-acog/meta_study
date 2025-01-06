import React from "react";

const ZoomControls = ({ handleZoom }) => {
  return (
    <div style={{ margin: "10px 0" }}>
      <button onClick={() => handleZoom("in")}>Zoom In</button>
      <button onClick={() => handleZoom("out")}>Zoom Out</button>
    </div>
  );
};

export default ZoomControls;
