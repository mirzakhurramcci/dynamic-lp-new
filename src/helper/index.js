import { v1 as uuidv1 } from "uuid";
// import ReactPixel from 'react-facebook-pixel';

const CDN_URL = "https://dox85mdhc5v5a.cloudfront.net/";
const CDN_URL_ASSETS = CDN_URL + "landingPageAssets/lp/";

const urlParams = new URLSearchParams(window.location.search);
// window.utm = {
const tracking_code = urlParams.get("utm_content")
  ? urlParams.get("utm_content")
  : uuidv1();
const compaign_name = urlParams.get("utm_campaign")
  ? urlParams.get("utm_campaign")
  : "";
const medium = urlParams.get("utm_medium")
  ? urlParams.get("utm_medium")
  : "Khaleef";
// subscriptionNo: urlParams.get("subscriptionNo")
// }
const countries = ["all"];
const languages = ["en", "ur", "ar"];
export const EnumType = {
  1: /^((\+92)?(0092)?(92)?(0)?)(3)([0-9]{2})((-?)|( ?))([0-9]{7})$/gm, // PK Operators regex
  2: /^(009665|9665|\+9665|05|5)(5|0|3)([0-9]{7})$/, // STC regex
  3: /^(009665|9665|\+9665|05|5)(6|4)([0-9]{7})$/, // Mobily regex
  4: /^(009665|9665|\+9665|05|5)(9|8)([0-9]{7})$/, // Zain regex
  5: /^(009665|9665|\+9665|05|5)(7)([0-9]{7})$/, // Virgin regex
};

const allPaths = window.location.pathname.split("/");

export const getCDNUrl = (filename) => {
  return CDN_URL_ASSETS + filename;
};
export const getTrackingCode = () => {
  return tracking_code;
};
export const getUTMMediun = () => {
  return medium;
};
export const getLastPathItem = (thePath) => {
  return thePath && thePath.substring(thePath.lastIndexOf("/") + 1);
};

export const getAllPathsInUrl = (url) => {
  return allPaths;
};

export const findCaseInsensitive = (array, value) => {
  return array.find((item) => value.toLowerCase() === item.toLowerCase());
};
export const getUserLanguage = () => {
  for (let j = 0; j < languages.length; j++) {
    const item = findCaseInsensitive(allPaths, languages[j]);
    if (item) {
      return item;
    }
  }
  return "en";
};

export const getUserCountry = () => {
  for (let j = 0; j < countries.length; j++) {
    const item = findCaseInsensitive(allPaths, countries[j]);
    if (item) {
      return item;
    }
  }
  return "all";
};

export const getMatchedValue = (array, value, defalt) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < value.length; j++) {
      if (array[i].toLowerCase() === value[j].toLowerCase())
        return value[j].toLowerCase();
    }
  }
  return defalt;
};
export const getMatchedItemFromResponse = (response, items) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i] in response) return response[items[i]];
  }
};
export const saveUTMParams = async (payload, event_name, msisdn) => {
  let gclid = urlParams.get("gclid");
  let url =
    "https://k8s.cricwick.net/khaleef-attribution/api/v1/attributions/mark_event?event_name=" +
    event_name +
    "&compaign_id=" +
    getCompaignId() +
    "&tracking_code=" +
    tracking_code +
    "&compaign_name=" +
    compaign_name +
    "&medium=" +
    medium +
    "&msisdn=" +
    msisdn +
    "&gclid=" +
    gclid;
  await fetch(url);
  // console.log(utmResponse);
};

export function getParametrByName(name) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var c = url.searchParams.get(name);

  return c ? c : "";
}

export const getErrorObj = (message) => {
  return {
    status: false,
    message: message,
  };
};

export const getNumbervalidObj = (number, internationalNumber, serviceId) => {
  return {
    status: true,
    international: internationalNumber,
    serviceId: serviceId,
    // prefix: prefix,
    number: number,
  };
};

const getDefaultUTM = () => {
  return getUserCountry() === "all" ? "67" : "67";
};
export const ValidateUTMSource = () => {
  let utm_source = urlParams.get("utm_source")
    ? urlParams.get("utm_source")
    : getDefaultUTM();
  // for (let i = 0; i < utms[p_id].length; i++) {
  if (utm_source) return true;
  // }
  return false;
};
const getCompaignId = () => {
  return urlParams.get("utm_source")
    ? urlParams.get("utm_source")
    : getDefaultUTM();
};
export const saveChargedEvent = async (response, msisdn) => {
  if ("is_charged" in response && response["is_charged"] === 1) {
    await saveUTMParams({}, "charged", msisdn);
  }
};

export const reportGtagConversion = async (response) => {
  // /////////////// Gtag case for user_charged //////////////////
  window.gtag_report_conversion();
};

export const ParamReplacer = (URL, paramObj) => {
  Object.keys(paramObj).forEach((paramName) => {
    URL = URL.replace(paramName, paramObj[paramName]);
  });
  return URL;
};

export const redirectOnMKTV = (number, medium, redirectLink) => {
  let paramObj = {
    param6: number,
    param9: medium,
  };
  if (urlParams.get("JSB") === 1) {
    window.redirectHbridge(ParamReplacer(redirectLink, paramObj));
  } else {
    window.location.href = ParamReplacer(redirectLink, paramObj);
  }
};

export const redirectOnZGames = (number) => {
  window.location.href = `https://cricwick.net?q=${number}`;
  return;
};
