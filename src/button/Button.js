import React from "react";
import language from "../translations";
import { getCDNUrl } from "../helper/index";

function Button({ lang, loading, validation, title }) {
  return (
    <button
      className="continueButton"
      disabled={loading}
      onClick={() => validation()}
    >
      <div className="dummyTop"></div>
      <div className="dummyBottom"></div>
      {!loading && (
        <img className="arrow" src={getCDNUrl("Pointer_LR.gif")} alt="" />
      )}
      {loading && language[lang].wait}
      {!loading && title}
      {!loading && (
        <img className="arrowR" src={getCDNUrl("Pointer_LR.gif")} alt="" />
      )}
    </button>
  );
}

export default Button;
