import React, { useEffect } from "react";
import checkBoxImg from "../../src/assets/checkbox.png";
import Button from "../button/Button";
import {
  saveUTMParams,
  getUTMMediun,
  saveChargedEvent,
  reportGtagConversion,
} from "../helper/index";
import language from "../translations";
import { LandingPageService } from "../Service/LandingPageService";

export default function EnterPin({ state, dispatch }) {
  const {
    lang,
    isHE,
    number,
    loading,
    pin,
    error,
    telco,
    isNumberPopulatedWithHE,
    // eslint-disable-next-line
    landingPageConfigData,
    // eslint-disable-next-line
    telcoName,
    // eslint-disable-next-line
    validConfigDataState,
    serviceId,
    subDetailsEndPoint,
    pinLength,
  } = state;
  const userAgent = navigator.userAgent;
  const confirmPin = async () => {
    dispatch({ type: "error", payload: "" });
    dispatch({ type: "loading", payload: true });

    const subSrc = getUTMMediun();
    let i = new Event("confirm_pin_pressed");
    isHE
      ? window.gtag("event", "he_second_button_pressed")
      : window.dataLayer.push({
          event: "custom.event." + i.type,
          "custom.gtm.element": i.target,
          "custom.gtm.originalEvent": i,
        });
    if (isHE) {
      try {
        let validConfigData = state.validConfigDataState;
        let resp = await fetch(
          telco.header.clicks[1].getUrl({
            ...state,
            subSrc,
            userAgent,
            validConfigData,
          })
        );
        resp = await resp.json();
        if (resp.status === 1) {
          // window.gtag("event", "he_second_button_pressed_success", { ...resp });
          // window.gtag("event", "header_subscription_successfull", { ...resp });
          reportGtagConversion(resp);
          await saveUTMParams(window.utm, "subscribe", number);
          let i = new Event("user_redirected");
          window.dataLayer.push({
            event: "custom.event." + i.type,
            "custom.gtm.element": i.target,
            "custom.gtm.originalEvent": i,
          });
          // window.gtag("event", "user_redirected", { ...resp });
          await saveChargedEvent(resp, number);
          let validConfigData = state.validConfigDataState;
          telco.startRedirection(number, "lp", validConfigData);
          return;
        } else {
          if (resp.responseCode === 102) {
            await saveChargedEvent(resp, number);
            let validConfigData = state.validConfigDataState;
            telco.startRedirection(number, "lp", validConfigData);
            return;
          }
          // window.gtag("event", "he_second_button_pressed_fail", { ...resp });
          dispatch({ type: "error", payload: resp.message });
          console.log("Confirm pin message", resp.message);
        }
      } catch (error) {
        console.error(error.message);
      }
    } else {
      try {
        let validConfigData = state.validConfigDataState;
        let resp = await fetch(
          telco.pinFlow.getConfirmPinUrl({
            ...state,
            subSrc,
            userAgent,
            validConfigData,
          })
        );
        resp = await resp.json();
        saveUTMParams(window.utm, "confirm_pin", number);
        if (resp.status === 1) {
          let ii = new Event("confirm_pin_pressed_success");
          window.dataLayer.push({
            event: "custom.event." + ii.type,
            "custom.gtm.element": ii.target,
            "custom.gtm.originalEvent": ii,
          });
          let xi = new Event("pinflow_subscription_successfull");
          window.dataLayer.push({
            event: "custom.event." + xi.type,
            "custom.gtm.element": xi.target,
            "custom.gtm.originalEvent": xi,
          });
          // window.gtag("event", "confirm_pin_pressed_success", { ...resp });
          // window.gtag("event", "pinflow_subscription_successfull", { ...resp });
          reportGtagConversion(resp);
          await saveUTMParams(window.utm, "subscribe", number);
          let i = new Event("user_redirected");
          window.dataLayer.push({
            event: "custom.event." + i.type,
            "custom.gtm.element": i.target,
            "custom.gtm.originalEvent": i,
          });
          // window.gtag("event", "user_redirected");
          await saveChargedEvent(resp, number);
          let validConfigData = state.validConfigDataState;
          telco.startRedirection(number, "lp", validConfigData);
        } else {
          let ii = new Event("confirm_pin_pressed_fail");
          window.dataLayer.push({
            event: "custom.event." + ii.type,
            "custom.gtm.element": ii.target,
            "custom.gtm.originalEvent": ii,
          });
          // window.gtag("event", "confirm_pin_pressed_fail", { ...resp });
          dispatch({ type: "error", payload: resp.message });
          console.log("Confirm pin message", resp.message);
        }
      } catch (error) {
        console.error(error.message);
      }
    }
    dispatch({ type: "loading", payload: false });
  };
  const validatePinLength = () => {
    dispatch({ type: "error", payload: "" });
    if (isHE) {
      confirmPin();
      return;
    }
    if (!isHE && isNumberPopulatedWithHE) {
      confirmPin();
      return;
    }
    let validPinLength;
    state.landingPageConfigData.data?.campaignServices.map(
      // eslint-disable-next-line
      (validPin) => {
        // eslint-disable-next-line
        if (validPin.telco == telcoName) {
          return (validPinLength = validPin.pinLength);
        }
      }
    );
    if (
      !isNumberPopulatedWithHE &&
      telco.validatePINLength(
        pin.trim(),
        validPinLength ? validPinLength : pinLength
      )
    ) {
      confirmPin();
      return;
    } else {
      dispatch({ type: "error", payload: language[lang].enterValidPin });
      return false;
    }
  };

  useEffect(() => {
    if (!isHE && isNumberPopulatedWithHE) {
      let url = subDetailsEndPoint;
      LandingPageService.getHEPin(url, telco.PARTNER_ID, serviceId)
        .then((resp) => {
          console.log(resp);
          if (resp.data.status === 1) {
            document
              .getElementById("input-pin")
              .setAttribute("value", resp.data.data.otp);
            dispatch({ type: "pin", payload: String(resp.data.data.otp) });
          }
        })
        .catch(console.log);
    }
    // eslint-disable-next-line
  }, []);
  return (
    <div className="input-form">
      {!isHE && (
        <>
          {/* <div className="label-text pin-text">
            {language[lang].enter_pin_page}
          </div>
          <div className="label-text pin-text pin-text-number">
            {number}
            <img
              styles={{
                width: "20px",
                filter: "invert(1)",
                margin: "2px 0px -3px 5px",
              }}
              src="https://img.icons8.com/external-regular-kawalan-studio/24/000000/external-edit-user-interface-regular-kawalan-studio.png"
            />
          </div> */}
          <div className="label-text">{language[lang].enter_pin}</div>
          <div className="input">
            <input
              type="tel"
              id="input-pin"
              onChange={(e) =>
                dispatch({ type: "pin", payload: e.target.value })
              }
              // eslint-disable-next-line
              placeholder={"E.g: " + "XXXX"}
              max={5}
              min={5}
            />
          </div>
        </>
      )}
      <div className="error"> {error}</div>
      <div className={lang === "en" ? "sub-btn en" : "sub-btn ur"}>
        <div className="back-button">
          <Button
            lang={lang}
            loading={loading}
            validation={validatePinLength}
            title={language[lang].subscribe}
          />
        </div>
      </div>
      <div className="terms-conditions">
        <img
          style={{ width: "16px", margin: "0 6px -3px 0", filter: "invert(1)" }}
          src={checkBoxImg}
          alt="checkbox.png"
        />
        {language[lang].terms_conditions}
      </div>
    </div>
  );
}
