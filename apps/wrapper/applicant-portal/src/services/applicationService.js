import { APIS } from "../constants";
import axiosService from "./axiosService";

const getData = (requestPayload) => {
  return axiosService.post(APIS.APPLICATIONS.STATUS_LIST, requestPayload);
};

const formsToOmit = (requestPayload) => {
  return axiosService.post(APIS.APPLICATIONS.OTHER_VALID_FORMS, requestPayload);
};

export const applicationService = {
  getData,
  formsToOmit
};
