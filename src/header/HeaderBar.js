import React from "react";
import { LanguageSelection } from "../language-selection/LanguageSelection";
var _ = require("lodash");

function HeaderBar({ dispatch, lang, languages }) {
  return (
    <section>
      <div className="top-bar">
        <LanguageSelection
          className="language-block"
          dispatch={dispatch}
          lang={lang}
          languages={_.uniqBy(languages)}
        />
      </div>
    </section>
  );
}

export default HeaderBar;
