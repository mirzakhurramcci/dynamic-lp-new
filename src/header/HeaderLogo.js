import React from "react";

function HeaderLogo({ lang, Logo }) {
  return (
    <div className="centerClass">
      <img
        className="Headerlogo"
        style={{ transition: "height 2s ease-in 0s" }}
        src={Logo}
        alt="logo"
      />
    </div>
  );
}

export default HeaderLogo;
