import axios from "axios";
export const LandingPageService = {
  landingPageConfig: async (data) => {
    const url = `https://cgknect.cricvids.co/landingPageConfig?campaignId=${data.campaignId}`;
    return await axios.get(url);
  },
  getIP: async () => {
    try {
      const URL = `https://db5lsmiefq6ejry3i7sxwlglni0quaqp.lambda-url.ap-southeast-1.on.aws/`;
      let resp = await fetch(URL);
      resp = await resp.json();
      return resp;
    } catch (error) {
      console.error(error.message);
    }
  },
  getNumberFromHeader: async (url) => {
    try {
      let resp = await fetch(url);
      resp = await resp.json();
      return resp;
    } catch (error) {
      console.error("Error in get number from header", error.message);
    }
  },
  getPKValidNumber: (number) => {
    const url = `http://sdp.knectapi.com:9001/api/subscriptions/checkPkOperator`;
    return axios.get(url, {
      params: {
        msisdn: `${number}`,
      },
    });
  },
  getInternationalValidNumber: (number) => {
    const url = `http://185.152.65.139:3456/`;
    return axios.get(url, {
      params: {
        n: `${number}`,
      },
    });
  },
  getHEPin: (url, partnerId, serviceId) => {
    return axios.get(url, {
      params: {
        partnerId: `${partnerId}`,
        serviceId: `${serviceId}`,
      },
    });
  },
};
