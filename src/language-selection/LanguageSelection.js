import React from "react";
export function LanguageSelection({ lang, dispatch, languages }) {
  const langaugeDisplay = {
    en: {
      key: "en",
      name: "EN",
      fontClassName: "font-family-en",
    },
    ur: {
      key: "ur",
      name: "UR",
      fontClassName: "font-family-ur",
    },
    ar: {
      key: "ar",
      name: "AR",
      fontClassName: "font-family-ur",
    },
  };

  return (
    <div className="  language-selection ">
      {languages.map((item) => {
        return (
          <div
            key={langaugeDisplay[item].key}
            className={
              `language-box ${langaugeDisplay[item].fontClassName} ` +
              (lang === item ? "language-selected" : "")
            }
            onClick={() => {
              dispatch({ type: "lang", payload: langaugeDisplay[item].key });
              dispatch({ type: "error", payload: "" });
            }}
          >
            {langaugeDisplay[item].name}
          </div>
        );
      })}
    </div>
  );
}
