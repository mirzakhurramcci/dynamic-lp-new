import React from "react";
import Button from "../button/Button";
import {
  saveUTMParams,
  getUTMMediun,
  saveChargedEvent,
  reportGtagConversion,
} from "../helper/index";
import language from "../translations";
import { LandingPageService } from "../Service/LandingPageService";
const _ = require("lodash");

function EnterNumber({ state, dispatch }) {
  const {
    lang,
    isHE,
    msisdn,
    number,
    telco,
    error,
    loading,
    configuration,
    // eslint-disable-next-line
    services,
    flow,
    landingPageConfigData,
    // eslint-disable-next-line
    validConfigDataState,
    placeHolder,
    ButtonText,
  } = state;
  const userAgent = navigator.userAgent;

  const sendPin = async (telco, number, telcoName, validConfigData) => {
    dispatch({ type: "loading", payload: true });
    dispatch({ type: "error", payload: "" });
    const subSrc = getUTMMediun(); //getParametrByName("utm_medium");
    let i;
    isHE
      ? (i = new Event("he_first_button_pressed"))
      : (i = new Event("send_pin_pressed"));
    window.dataLayer.push({
      event: "custom.event." + i.type,
      "custom.gtm.element": i.target,
      "custom.gtm.originalEvent": i,
    });
    if (isHE) {
      try {
        let url;
        if (state.flow === "SINGLE_CLICK") {
          let validConfigData = state.validConfigDataState;
          url = telco.header.singleClick.getUrl({
            ...state,
            subSrc,
            userAgent,
            number,
            validConfigData,
          });
        } else {
          let validConfigData = state.validConfigDataState;
          url = telco.header.clicks[0].getUrl({
            ...state,
            subSrc,
            userAgent,
            number,
            validConfigData,
          });
        }
        let resp = await fetch(url);
        resp = await resp.json();
        if (resp.status === 1) {
          if (state.flow === "SINGLE_CLICK") {
            // window.gtag(
            //   "event",
            //   "he_first_button_single_click_pressed_success",
            //   { ...resp }
            // );
            // window.gtag("event", "he_user_single_click_success", { ...resp });
            reportGtagConversion(resp);
            await saveUTMParams(window.utm, "subscribe", number);
            await saveChargedEvent(resp, number);
            let validConfigData = state.validConfigDataState;
            telco.startRedirection(number, "sblp", validConfigData);
            return;
          }
          dispatch({ type: "pinSent", payload: true });
          dispatch({ type: "token", payload: resp.data.token });

          // window.gtag("event", "he_first_button_pressed_success", { ...resp });
        } else {
          if (resp.responseCode === 102) {
            // window.gtag("event", "he_user_asub_redirected", { ...resp });
            await saveChargedEvent(resp, number);
            let validConfigData = state.validConfigDataState;
            telco.startRedirection(number, "asblp", validConfigData);
            return;
          }
          dispatch({ type: "error", payload: resp.message });
          // window.gtag("event", "he_first_button_pressed_fail", { ...resp });
          if (state.flow === "SINGLE_CLICK")
            window.gtag("event", "he_first_button_single_click_pressed_fail", {
              ...resp,
            });
        }
      } catch (error) {
        console.error(error.message);
      }
    } else {
      if (validConfigData)
        try {
          let resp = await fetch(
            telco.pinFlow.getSendPinUrl({
              ...state,
              subSrc,
              userAgent,
              number,
              validConfigData,
            })
          );
          dispatch({
            type: "serviceId",
            payload: validConfigData.serviceId,
          });
          resp = await resp.json();
          if (resp.status === 1) {
            dispatch({ type: "pinSent", payload: true });
            let i = new Event("send_pin_pressed_success");
            window.dataLayer.push({
              event: "custom.event." + i.type,
              "custom.gtm.element": i.target,
              "custom.gtm.originalEvent": i,
            });
            // window.gtag("event", "send_pin_pressed_success", { ...resp });
            saveUTMParams(window.utm, "send_pin", msisdn ? msisdn : number);
          } else {
            console.log("error: ", resp);
            if (
              resp.message.toLowerCase() === "already sub" ||
              resp.message.toLowerCase() ===
                "user already subscribed on the requested service"
            ) {
              window.gtag("event", "user_asub_redirected", { ...resp });
              await saveChargedEvent(resp, number);
              console.log("already sub");
              telco.startRedirection(number, "sblp", validConfigData);
              return;
            }
            dispatch({ type: "error", payload: resp.message });
            let i = new Event("send_pin_pressed_fail");
            window.dataLayer.push({
              event: "custom.event." + i.type,
              "custom.gtm.element": i.target,
              "custom.gtm.originalEvent": i,
            });
            // window.gtag("event", "send_pin_pressed_fail", { ...resp });
            console.log("Send pin message", resp.message);
          }
        } catch (error) {
          console.error(error.message);
        }
      else {
        dispatch({ type: "loading", payload: false });
        return dispatch({
          type: "error",
          payload: language[lang].enterValidNumber,
        });
      }
    }
    dispatch({ type: "loading", payload: false });
  };
  const validation = () => {
    dispatch({ type: "loading", payload: true });

    if (isHE) {
      sendPin(telco, number);
      return;
    }
    let response = configuration.validateNum(
      number,
      landingPageConfigData.data?.campaignServices
    );
    if (response && response.status === true) {
      if (!response.international)
        LandingPageService.getPKValidNumber(response.number).then((resp) => {
          if (!resp.data.status) {
            dispatch({
              type: "error",
              payload: language[lang].enterValidNumber,
            });
            dispatch({ type: "loading", payload: false });
          } else {
            let telcoName = resp.data.telco.name;
            let telco = configuration.services[0];
            console.log("Success!", telcoName);
            if (telco) {
              dispatch({ type: "telco", payload: telco });
              dispatch({ type: "number", payload: response.number });
              dispatch({ type: "telcoName", payload: telcoName });

              let validConfigData;
              if (
                // eslint-disable-next-line
                resp.data.telco.type == "postpaid" &&
                // eslint-disable-next-line
                telcoName == "mobilink"
              ) {
                state.landingPageConfigData.data?.campaignServices.map(
                  // eslint-disable-next-line
                  (serviceIdObject) => {
                    // eslint-disable-next-line
                    if (serviceIdObject.telco == telcoName + "Post") {
                      dispatch({ type: "error", payload: "" });
                      dispatch({
                        type: "mcpScriptLink",
                        payload: serviceIdObject.mcpScript,
                      });
                      return (validConfigData = {
                        serviceId: serviceIdObject.serviceId,
                        campaignId: serviceIdObject.campaignId,
                        redirectLink: serviceIdObject.redirectLink,
                      });
                    } else {
                      dispatch({
                        type: "error",
                        payload: language[lang].enterValidNumber,
                      });
                      dispatch({ type: "loading", payload: false });
                    }
                  }
                );
                if (validConfigData) {
                  let campaignIntegration = _.groupBy(
                    state.landingPageConfigData.data?.campaignIntegration,
                    "serviceId"
                  );
                  // eslint-disable-next-line
                  campaignIntegration[validConfigData?.serviceId].map(
                    // eslint-disable-next-line
                    (data) => {
                      if (data.type === "SEND_PIN")
                        return (validConfigData = {
                          ...validConfigData,
                          SEND_PIN: data.endPoints,
                        });
                      if (data.type === "CONFIRM_PIN")
                        return (validConfigData = {
                          ...validConfigData,
                          CONFIRM_PIN: data.endPoints,
                        });
                      if (data.type === "HE_URL")
                        return (validConfigData = {
                          ...validConfigData,
                          HE_URL: data.endPoints,
                        });
                      if (data.type === "CHECK_STATUS")
                        return (validConfigData = {
                          ...validConfigData,
                          CHECK_STATUS: data.endPoints,
                        });
                      if (data.type === "FIRST_CLICK")
                        return (validConfigData = {
                          ...validConfigData,
                          FIRST_CLICK: data.endPoints,
                        });
                      if (data.type === "SECOND_CLICK")
                        return (validConfigData = {
                          ...validConfigData,
                          SECOND_CLICK: data.endPoints,
                        });
                      if (data.type === "SINGLE_CLICK")
                        return (validConfigData = {
                          ...validConfigData,
                          SINGLE_CLICK: data.endPoints,
                        });
                    }
                  );
                } else {
                  dispatch({ type: "loading", payload: false });
                  return dispatch({
                    type: "error",
                    payload: language[lang].enterValidNumber,
                  });
                }
              } else {
                state.landingPageConfigData?.data.campaignServices.map(
                  // eslint-disable-next-line
                  (serviceIdObject) => {
                    // eslint-disable-next-line
                    if (serviceIdObject.telco == telcoName) {
                      dispatch({ type: "error", payload: "" });
                      dispatch({
                        type: "mcpScriptLink",
                        payload: serviceIdObject.mcpScript,
                      });
                      return (validConfigData = {
                        serviceId: serviceIdObject.serviceId,
                        campaignId: serviceIdObject.campaignId,
                        redirectLink: serviceIdObject.redirectLink,
                      });
                    } else {
                      dispatch({
                        type: "error",
                        payload: language[lang].enterValidNumber,
                      });
                      dispatch({ type: "loading", payload: false });
                    }
                  }
                );
                if (validConfigData) {
                  let campaignIntegration = _.groupBy(
                    state.landingPageConfigData.data?.campaignIntegration,
                    "serviceId"
                  );
                  // eslint-disable-next-line
                  campaignIntegration[validConfigData?.serviceId].map(
                    // eslint-disable-next-line
                    (data) => {
                      if (data.type === "SEND_PIN")
                        return (validConfigData = {
                          ...validConfigData,
                          SEND_PIN: data.endPoints,
                        });
                      if (data.type === "CONFIRM_PIN")
                        return (validConfigData = {
                          ...validConfigData,
                          CONFIRM_PIN: data.endPoints,
                        });
                      if (data.type === "HE_URL")
                        return (validConfigData = {
                          ...validConfigData,
                          HE_URL: data.endPoints,
                        });
                      if (data.type === "CHECK_STATUS")
                        return (validConfigData = {
                          ...validConfigData,
                          CHECK_STATUS: data.endPoints,
                        });
                      if (data.type === "FIRST_CLICK")
                        return (validConfigData = {
                          ...validConfigData,
                          FIRST_CLICK: data.endPoints,
                        });
                      if (data.type === "SECOND_CLICK")
                        return (validConfigData = {
                          ...validConfigData,
                          SECOND_CLICK: data.endPoints,
                        });
                      if (data.type === "SINGLE_CLICK")
                        return (validConfigData = {
                          ...validConfigData,
                          SINGLE_CLICK: data.endPoints,
                        });
                    }
                  );
                } else {
                  dispatch({ type: "loading", payload: false });
                  return dispatch({
                    type: "error",
                    payload: language[lang].enterValidNumber,
                  });
                }
              }

              dispatch({
                type: "validConfigDataState",
                payload: validConfigData,
              });
              sendPin(telco, response.number, telcoName, validConfigData);
            } else {
              dispatch({
                type: "error",
                payload: language[lang].enter_ufone_telenor_num,
              });
              dispatch({ type: "loading", payload: false });
            }
          }
        });
      else {
        let telco = configuration.services[0];
        if (telco) {
          dispatch({ type: "telco", payload: telco });
          dispatch({ type: "number", payload: response.number });
          let validConfigData;
          state.landingPageConfigData.data?.campaignServices.map(
            // eslint-disable-next-line
            (serviceIdObject) => {
              // eslint-disable-next-line
              if (serviceIdObject.serviceId == response.serviceId) {
                dispatch({
                  type: "pinLength",
                  payload: serviceIdObject.pinLength,
                });
                dispatch({
                  type: "mcpScriptLink",
                  payload: serviceIdObject.mcpScript,
                });
                return (validConfigData = {
                  serviceId: response.serviceId,
                  campaignId: serviceIdObject.campaignId,
                  redirectLink: serviceIdObject.redirectLink,
                });
              }
            }
          );
          if (validConfigData) {
            let campaignIntegration = _.groupBy(
              state.landingPageConfigData.data?.campaignIntegration,
              "serviceId"
            );
            // eslint-disable-next-line
            campaignIntegration[validConfigData?.serviceId].map(
              // eslint-disable-next-line
              (data) => {
                if (data.type === "SEND_PIN")
                  return (validConfigData = {
                    ...validConfigData,
                    SEND_PIN: data.endPoints,
                  });
                if (data.type === "CONFIRM_PIN")
                  return (validConfigData = {
                    ...validConfigData,
                    CONFIRM_PIN: data.endPoints,
                  });
                if (data.type === "HE_URL")
                  return (validConfigData = {
                    ...validConfigData,
                    HE_URL: data.endPoints,
                  });
                if (data.type === "CHECK_STATUS")
                  return (validConfigData = {
                    ...validConfigData,
                    CHECK_STATUS: data.endPoints,
                  });
                if (data.type === "FIRST_CLICK")
                  return (validConfigData = {
                    ...validConfigData,
                    FIRST_CLICK: data.endPoints,
                  });
                if (data.type === "SECOND_CLICK")
                  return (validConfigData = {
                    ...validConfigData,
                    SECOND_CLICK: data.endPoints,
                  });
                if (data.type === "SINGLE_CLICK")
                  return (validConfigData = {
                    ...validConfigData,
                    SINGLE_CLICK: data.endPoints,
                  });
              }
            );
            dispatch({
              type: "validConfigDataState",
              payload: validConfigData,
            });
            sendPin(telco, response.number, response.number, validConfigData);
          }
        } else {
          dispatch({
            type: "error",
            payload: language[lang].enter_ufone_telenor_num,
          });
          dispatch({ type: "loading", payload: false });
        }
      }
    } else {
      dispatch({
        type: "error",
        payload: language[lang].enterValidNumber,
      });
      dispatch({ type: "loading", payload: false });
    }
  };
  return (
    <div className="input-form">
      <>
        <div className="label-text">{language[lang].enter_number}</div>
        <div className="input">
          <input
            id="number"
            type="number"
            value={number}
            disabled={isHE}
            onChange={(e) =>
              dispatch({ type: "number", payload: e.target.value })
            }
            placeholder={placeHolder ? placeHolder : "E.g: 03XXXXXXXXX"}
          ></input>
        </div>
      </>
      <div className={lang === "en" ? "error en" : "error ur"}> {error}</div>
      <div className={lang === "en" ? "sub-btn en" : "sub-btn ur"}>
        <Button
          lang={lang}
          loading={loading}
          validation={validation}
          flow={flow}
          title={
            flow === "SINGLE_CLICK"
              ? language[lang].subscribe
              : ButtonText === "SUBSCRIBE"
              ? language[lang].subscribe
              : ButtonText === "CONTINUE"
              ? language[lang].continue
              : ButtonText === "GET OTP"
              ? language[lang].get_otp
              : ButtonText === "GET PIN"
              ? language[lang].get_pin
              : language[lang].continue
          }
        />
      </div>
    </div>
  );
}

export default EnterNumber;
