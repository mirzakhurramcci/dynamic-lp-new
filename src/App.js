import React, { useReducer, useEffect, Fragment, Suspense, lazy } from "react";
import "./App.css";
// import Loader from "./loader/Loader";
import { LandingPageService } from "./Service/LandingPageService";
import {
  getUserLanguage,
  getUserCountry,
  getMatchedItemFromResponse,
  ValidateUTMSource,
  saveUTMParams,
  getParametrByName,
} from "./helper";
import Content from "./content/Content";
var _ = require("lodash");

const HeaderBarComponent = lazy(() => import("./header/HeaderBar" /* b */));
const HeaderBanner = lazy(() => import("./header/HeaderBanner" /* l */));
const HeaderLogo = lazy(() => import("./header/HeaderLogo" /* l */));
const EnterNumberComponent = lazy(() =>
  import("./EnterNumber/EnterNumber" /* n */)
);
const EnterPinComponent = lazy(() => import("./EnterPin/EnterPin" /* pn */));
const initialState = {
  lang: "en",
  error: "",
  loading: false,
  number: "",
  pin: "",
  isHE: false,
  isNumberPopulatedWithHE: false,
  loadingHE: false,
  ip: "",
  pinSent: false,
  isHttps: false,
  country: undefined,
  telco: undefined,
  headerClickCount: 0,
  flow: "",
  utmValidationStatus: false,
  configuration: undefined,
  services: [],
  freeGames: false,
  isHEpartnerId: "",
  isHEserviceId: "",
  landingPageConfigData: {},
  telcoName: "",
  validConfigDataState: "",
  serviceId: 0,
  subDetailsEndPoint: "",
  placeHolder: "",
  ButtonText: "",
  pinLength: null,
  mcpScriptLink: "",
};

function reducer(state, action) {
  return { ...state, [action.type]: action.payload };
}
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    let campaignId;
    if (getParametrByName("campaignId")) {
      campaignId = { campaignId: getParametrByName("campaignId") };
    } else {
      campaignId = { campaignId: 45 };
    }
    LandingPageService.landingPageConfig(campaignId)
      .then((resp) => {
        if (resp.data.statusCode === 1) {
          if (resp.data.data.assets.nameTag) {
            document.getElementById("LP-title").innerText =
              resp.data.data.assets.nameTag;
          }
          if (resp.data.data.assets.cssLink) {
            document
              .getElementById("campaign-css")
              .setAttribute("href", resp.data.data.assets.cssLink);
          }
          // if (resp.data.data.assets.scripts) {
          //   window.googleEventId = resp.data.data.assets.scripts;
          // }
          // if (resp.data.data.assets.AnalyticsID) {
          //   let srcLink = `https://www.googletagmanager.com/gtag/js?id=${resp.data.data.assets.AnalyticsID}`;
          //   document
          //     .getElementById("googleAnalyticsId")
          //     .setAttribute("src", srcLink);
          //   window.gtag("js", new Date());
          //   window.gtag("config", resp.data.data.assets.AnalyticsID);
          // }
          if (resp.data.data.assets.placeHolder) {
            dispatch({
              type: "placeHolder",
              payload: resp.data.data.assets.placeHolder,
            });
          }
          if (resp.data.data.assets.ButtonText) {
            dispatch({
              type: "ButtonText",
              payload: resp.data.data.assets.ButtonText,
            });
          }
          dispatch({ type: "landingPageConfigData", payload: resp.data });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    if (window.location.protocol === "https" && !state.isHttps) {
      dispatch({ type: "isHttps", payload: true });
    }
    if (!ValidateUTMSource()) {
      dispatch({ type: "utmValidationStatus", payload: false });
      console.error("Error UTM VALIDATION FAILS");
      return;
    }
    dispatch({ type: "utmValidationStatus", payload: true });
    dispatch({ type: "country", payload: getUserCountry() });
    dispatch({
      type: "lang",
      payload: getUserLanguage(),
    });
  }, [state.isHttps]);

  useEffect(() => {
    if (state.country)
      (async function () {
        let config = await import("./Configuration/" + state.country);
        if (config) {
          config = config.default[state.country];
          // console.log(state.landingPageConfigData);
          let validServiceId = _.groupBy(
            state.landingPageConfigData.data?.campaignServices,
            "serviceId"
          );
          let serviceIdsArray = [];
          for (const [key] of Object.entries(validServiceId)) {
            serviceIdsArray.push(parseInt(key));
          }
          let validServices = config.getValidServices(validServiceId);
          dispatch({ type: "configuration", payload: config });
          dispatch({ type: "services", payload: validServices });
          dispatch({ type: "loadingHE", payload: true });
          saveUTMParams(window.utm, "install", "");
          let validConfigData;
          // eslint-disable-next-line
          state.landingPageConfigData.data?.campaignIntegration.map((flow) => {
            if (flow.type === "SEND_PIN")
              return (validConfigData = {
                ...validConfigData,
                SEND_PIN: flow.endPoints,
              });
            if (flow.type === "FIRST_CLICK")
              return (validConfigData = {
                ...validConfigData,
                FIRST_CLICK: flow.endPoints,
              });
            if (flow.type === "CONFIRM_PIN")
              return (validConfigData = {
                ...validConfigData,
                CONFIRM_PIN: flow.endPoints,
              });
            if (flow.type === "CHECK_STATUS")
              return (validConfigData = {
                ...validConfigData,
                CHECK_STATUS: flow.endPoints,
              });
            if (flow.type === "FIRST_CLICK")
              return (validConfigData = {
                ...validConfigData,
                FIRST_CLICK: flow.endPoints,
              });
            if (flow.type === "SECOND_CLICK")
              return (validConfigData = {
                ...validConfigData,
                SECOND_CLICK: flow.endPoints,
              });
            if (flow.type === "SINGLE_CLICK")
              return (validConfigData = {
                ...validConfigData,
                SINGLE_CLICK: flow.endPoints,
              });
            if (flow.type === "GET_SUB_DETAILS")
              return (validConfigData = {
                ...validConfigData,
                GET_SUB_DETAILS: flow.endPoints,
              });
            // eslint-disable-next-line
            if (flow.type == "HE_URL") {
              state.landingPageConfigData.data?.campaignServices.map(
                // eslint-disable-next-line
                (serviceIdObject) => {
                  // eslint-disable-next-line
                  if (flow.serviceId == serviceIdObject.serviceId) {
                    return (validConfigData = {
                      ...validConfigData,
                      redirectLink: serviceIdObject.redirectLink,
                      campaignId: serviceIdObject.campaignId,
                    });
                  }
                }
              );
              let serviceId = flow.serviceId;
              let endPoints = flow.endPoints;
              LandingPageService.getNumberFromHeader(
                config.services[0].header.getNumberUrl(endPoints, serviceId)
              ).then(
                (NFHResponse) => {
                  if (NFHResponse.status === 1) {
                    validConfigData = {
                      ...validConfigData,
                      serviceId: serviceId,
                    };
                    dispatch({
                      type: "validConfigDataState",
                      payload: validConfigData,
                    });
                    dispatch({
                      type: "isHE",
                      payload: NFHResponse.data.flow === "OTP" ? false : true,
                    });
                    if (NFHResponse.data.flow === "OTP") {
                      dispatch({
                        type: "isNumberPopulatedWithHE",
                        payload: true,
                      });
                      dispatch({
                        type: "serviceId",
                        payload: serviceId,
                      });
                      dispatch({
                        type: "subDetailsEndPoint",
                        payload: validConfigData.GET_SUB_DETAILS,
                      });
                    }
                    let number = getMatchedItemFromResponse(NFHResponse.data, [
                      "number",
                      "msisdn",
                    ]);
                    dispatch({ type: "number", payload: number });
                    dispatch({
                      type: "token",
                      payload: NFHResponse.data.token,
                    });
                    dispatch({
                      type: "flow",
                      payload: NFHResponse.data.flow,
                    });
                    let i = new Event("header_found");
                    window.dataLayer.push({
                      event: "custom.event." + i.type,
                      "custom.gtm.element": i.target,
                      "custom.gtm.originalEvent": i,
                    });
                    // window.gtag("event", "header_found", { ...NFHResponse });
                    dispatch({ type: "telco", payload: config.services[0] });
                    saveUTMParams(window.utm, "install", number ? number : "");
                  }
                  dispatch({ type: "loadingHE", payload: false });
                },
                () => {
                  dispatch({ type: "loadingHE", payload: false });
                }
              );
            }
          });
          LandingPageService.getIP().then((getIp) => {
            dispatch({ type: "ip", payload: getIp["x-forwarded-for"] });
          });
        }
      })();
    // eslint-disable-next-line
  }, [state.landingPageConfigData.data]);

  useEffect(() => {
    if (state.mcpScriptLink) {
      // let mcpUuid;
      const uuid = Date.now() + String(Math.ceil(Math.random() * 10000000));
      window.mcpUuid = uuid;
      //load MCP script here
      let scriptTag = document.createElement("script");
      scriptTag.setAttribute("src", state.mcpScriptLink);
      document.body.appendChild(scriptTag);
      // eval(script);
    }
    // else
    //   console.log("else load MCP SCRIPT");
  }, [state.mcpScriptLink]);

  const emptyView = () => {
    return <div></div>;
  };
  const mainView = () => {
    return (
      <div className="container">
        <div className={state.lang === "en" ? "en" : "ur"}>
          <Fragment>
            <div>
              <Suspense fallback={<></>}>
                <HeaderBarComponent
                  dispatch={dispatch}
                  lang={state.lang}
                  languages={state.landingPageConfigData.data?.campaignServices.map(
                    (lang) => {
                      // eslint-disable-next-line
                      return lang.name == "english"
                        ? "en"
                        : // eslint-disable-next-line
                        lang.name == "urdu"
                        ? "ur"
                        : // eslint-disable-next-line
                        lang.name == "arabic"
                        ? "ar"
                        : "";
                    }
                  )}
                />
                {state.landingPageConfigData.data?.assets?.LpLogo && (
                  <HeaderLogo
                    lang={state.lang}
                    Logo={state.landingPageConfigData.data.assets.LpLogo}
                  />
                )}
              </Suspense>
            </div>
            {state.landingPageConfigData.data && (
              <div style={{ minHeight: "22%" }}>
                <Suspense fallback={<></>}>
                  <HeaderBanner
                    lang={state.lang}
                    landingPageLogo={
                      state.landingPageConfigData.data.assets.assets
                    }
                  />
                </Suspense>
              </div>
            )}
            <div>
              <Suspense fallback={<></>}>
                <section>
                  {!state.pinSent && (
                    <EnterNumberComponent state={state} dispatch={dispatch} />
                  )}
                  {state.pinSent && (
                    <EnterPinComponent state={state} dispatch={dispatch} />
                  )}
                </section>
              </Suspense>
            </div>
            <div>
              <Suspense fallback={<></>}>
                {state.landingPageConfigData.data?.campaignServices.map(
                  (data, i) => (
                    <div className="price-points-normal" key={i}>
                      {
                        // eslint-disable-next-line
                        state.lang == (data.name == "english" ? "en" : "")
                          ? data.pricePoints
                          : // eslint-disable-next-line
                          state.lang == (data.name == "urdu" ? "ur" : "")
                          ? data.pricePoints
                          : // eslint-disable-next-line
                          state.lang == (data.name == "arabic" ? "ar" : "")
                          ? data.pricePoints
                          : ""
                      }
                    </div>
                  )
                )}
              </Suspense>
            </div>
            {state.landingPageConfigData.data?.campaignContent && (
              <div>
                <Suspense fallback={<></>}>
                  <Content
                    content={state.landingPageConfigData.data.campaignContent}
                  />
                </Suspense>
              </div>
            )}
          </Fragment>
        </div>
      </div>
    );
  };

  return (
    <>
      {state.isHttps
        ? emptyView()
        : state.utmValidationStatus
        ? mainView()
        : emptyView()}
    </>
  );
}

export default App;
