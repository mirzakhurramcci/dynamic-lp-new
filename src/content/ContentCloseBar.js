import React from "react";
import "./ContentCloseBar.css";

const ContentCloseBar = (props) => {
  return (
    <div className="VideoPlay-VideoPlayBox">
      <div className="VideoPlayCloseIcon" onClick={props.handleClose}>
        x
      </div>
    </div>
  );
};

export default ContentCloseBar;
