import React from "react";

function HeaderBanner({ landingPageLogo }) {
  return (
    <div className="centerClass">
      <img
        className="logo"
        style={{ transition: "height 2s ease-in" }}
        src={landingPageLogo}
        alt="logo"
      />
    </div>
  );
}

export default HeaderBanner;
