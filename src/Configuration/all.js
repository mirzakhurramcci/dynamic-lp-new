import {
  getParametrByName,
  EnumType,
  getErrorObj,
  getNumbervalidObj,
  redirectOnMKTV,
  ParamReplacer,
} from "../helper";
var _ = require("lodash");

const validateNumberByRegex = (number, regex, serviceId) => {
  let internationalNumber;
  if (number.trim().length === 0) {
    return getErrorObj("Please enter Valid number");
  }
  // eslint-disable-next-line
  if (EnumType[regex].test(number) && regex == 1) {
    internationalNumber = false;
    number = number.replace("92", 0);
    return getNumbervalidObj(number);
    // eslint-disable-next-line
  } else if (regex != 1) {
    if (EnumType[regex].test(number)) {
      internationalNumber = true;
      // console.log("Int Number", number, internationalNumber, serviceId);
      return getNumbervalidObj(number, internationalNumber, serviceId);
    }
  } else {
    return {
      status: false,
      message: "Please enter Valid number",
    };
  }
};
class ConfigManager {
  // singleton instance
  static instance = null;
  cricwick = "http://cricwick.net/knect/";

  configuration = {
    all: {
      services: [
        {
          PARTNER_ID: 2,
          defaults: true,
          header: {
            getNumberUrl: (endPoints, serviceId) => {
              let partner_id = getParametrByName("partner_id");
              let paramObj = {
                param1: serviceId,
                param2: partner_id
                  ? partner_id
                  : this.configuration.all.services[0].PARTNER_ID,
              };
              return ParamReplacer(endPoints, paramObj);
            },
            singleClick: {
              getUrl: ({ token, ip, subSrc, validConfigData }) => {
                let partner_id = getParametrByName("partner_id");
                let paramObj = {
                  param10: token,
                  param1: validConfigData.serviceId,
                  param2: partner_id
                    ? partner_id
                    : this.configuration.all.services[0].PARTNER_ID,
                  param3: subSrc,
                  param4: validConfigData.campaignId,
                  param5: ip,
                };
                return ParamReplacer(validConfigData.SINGLE_CLICK, paramObj);
              },
            },
            clicks: [
              {
                getUrl: ({ token, ip, subSrc, validConfigData }) => {
                  let partner_id = getParametrByName("partner_id");
                  let paramObj = {
                    param10: token,
                    param1: validConfigData.serviceId,
                    param2: partner_id
                      ? partner_id
                      : this.configuration.all.services[0].PARTNER_ID,
                    param3: subSrc,
                    param4: validConfigData.campaignId,
                    param5: ip,
                    param11: partner_id
                      ? partner_id
                      : this.configuration.all.services[0].PARTNER_ID,
                  };
                  return ParamReplacer(validConfigData.FIRST_CLICK, paramObj);
                },
              },
              {
                getUrl: ({ token, number, userAgent, validConfigData }) => {
                  let partner_id = getParametrByName("partner_id");
                  let paramObj = {
                    param1: validConfigData.serviceId,
                    param2: partner_id
                      ? partner_id
                      : this.configuration.all.services[0].PARTNER_ID,
                    param10: token,
                    param4: validConfigData.campaignId,
                    param6: number,
                    param7: userAgent,
                  };
                  return ParamReplacer(validConfigData.SECOND_CLICK, paramObj);
                },
              },
            ],
          },
          pinFlow: {
            getSendPinUrl: ({
              ip,
              subSrc,
              number,
              userAgent,
              validConfigData,
            }) => {
              let partner_id = getParametrByName("partner_id");
              let paramObj = {
                param1: validConfigData.serviceId,
                param2: partner_id
                  ? partner_id
                  : this.configuration.all.services[0].PARTNER_ID,
                param3: subSrc,
                param4: validConfigData.campaignId,
                param5: ip,
                param6: number,
                param7: userAgent,
                ...(window.mcpUuid && {
                  param12: window.mcpUuid,
                }),
              };
              return ParamReplacer(validConfigData.SEND_PIN, paramObj);
            },
            getConfirmPinUrl: ({
              ip,
              subSrc,
              number,
              userAgent,
              pin,
              validConfigData,
            }) => {
              let partner_id = getParametrByName("partner_id");
              let paramObj = {
                param1: validConfigData.serviceId,
                param2: partner_id
                  ? partner_id
                  : this.configuration.all.services[0].PARTNER_ID,
                param3: subSrc,
                param4: validConfigData.campaignId,
                param5: ip,
                param6: number,
                param7: userAgent,
                param8: pin.trim(),
                ...(window.mcpUuid && {
                  param12: window.mcpUuid,
                }),
              };
              return ParamReplacer(validConfigData.CONFIRM_PIN, paramObj);
            },
            // isMcpEnabled: false,
            // mcpScript: (mcpScriptLink) => mcpScriptLink,
          },
          validatePINLength: (pin, validNumberPin) => {
            if (pin.length <= parseInt(validNumberPin)) {
              return true;
            }
            return false;
          },
          startRedirection: (number, medium, validConfigData) => {
            redirectOnMKTV(number, medium, validConfigData.redirectLink);
          },
        },
      ],
      placeHolder: "E.g: 03XXXXXXXXX",
      validateNum: (number, numberRegex) => {
        numberRegex = _.groupBy(numberRegex, "serviceId");
        for (const [, value] of Object.entries(numberRegex)) {
          const numberValidationResp = validateNumberByRegex(
            number,
            value[0].regex,
            value[0].serviceId
          );
          if (numberValidationResp?.status) return numberValidationResp;
          // eslint-disable-next-line
          else if (numberValidationResp?.status == false)
            return {
              status: false,
              message: "Please enter Valid number",
            };
        }
      },
      getValidServices: (validServiceId) => {
        return [validServiceId];
      },
    },
  };

  static createInstance() {
    var object = new ConfigManager();
    return object;
  }

  static getInstance() {
    if (!ConfigManager.instance) {
      ConfigManager.instance = ConfigManager.createInstance();
    }
    return ConfigManager.instance;
  }
}

const configManager = new ConfigManager();
const configurationObj = {
  ...configManager.configuration,
  updateConfig: configManager.updateConfig,
};
export default configurationObj;
