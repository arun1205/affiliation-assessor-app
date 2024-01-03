
import React, { useState, useEffect, useContext, useRef } from "react";

import { Routes, useNavigate, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faXmark } from "@fortawesome/free-solid-svg-icons";

import ROUTE_MAP from "../../routing/routeMap";

import { StateContext } from "../../App";

import store from '../../utils/enketo/module/store';

import {

  getStatusOfForms,

  registerEvent,
  setFormDataFromApi,
  saveFormSubmission,

  updateFormStatus,
  getEnketoFormData,

  getPrefillXML,

} from "../../api";

import {

  getCookie,

  getFormData,

  handleFormEvents,

  updateFormData,

  removeItemFromLocalForage,

  getSpecificDataFromForage,

  getLocalTimeInISOFormat,

  getFromLocalForage,

  getOfflineCapableForm,

  setToLocalForage,

} from "../../utils";

import CommonLayout from "../../components/CommonLayout";

import CommonModal from "../../components/Modal";

import localforage from "localforage";

const ENKETO_MANAGER_URL = process.env.REACT_APP_ENKETO_MANAGER_URL;

const ENKETO_URL = process.env.REACT_APP_ENKETO_URL;

const GCP_URL = process.env.REACT_APP_GCP_AFFILIATION_LINK;

let previewFlag = false;

const GenericOdkForm = (props) => {

  const user = getCookie("userData");

  let { formName, date } = useParams();

  const scheduleId = useRef();

  const [isPreview, setIsPreview] = useState(false);

  const [surveyUrl, setSurveyUrl] = useState("");

  const [formLoaded, setFormLoaded] = useState(false);

  const userId = user?.userRepresentation?.id;

  const [formDataFromApi, setFormDataFromApi] = useState();
  const [formStatus, setFormStatus] = useState("");

  let formSpec = {

    forms: {

      [formName]: {

        skipOnSuccessMessage: true,

        prefill: {},

        submissionURL: "",

        name: formName,

        successCheck: "async (formData) => { return true; }",

        onSuccess: {

          notificationMessage: "Form submitted successfully",

          sideEffect: "async (formData) => { console.log(formData); }",

        },

        onFailure: {

          message: "Form submission failed",

          sideEffect: "async (formData) => { console.log(formData); }",

          next: {

            type: "url",

            id: "google",

          },

        },

      },

    },

    start: formName,

    date: date,

    metaData: {},

  };

  const getFormURI = (form, ofsd, prefillSpec) => {

    return encodeURIComponent(

      `${ENKETO_MANAGER_URL}/prefillXML?formUrl=${form}&onFormSuccessData=${encodeFunction(

        ofsd

      )}&prefillSpec=${encodeFunction(prefillSpec)}`

    );

  };

  const navigate = useNavigate();

  const encodeFunction = (func) => encodeURIComponent(JSON.stringify(func));

  const startingForm = formSpec.start;

  const [formId, setFormId] = useState(startingForm);

  const [encodedFormSpec, setEncodedFormSpec] = useState(

    encodeURI(JSON.stringify(formSpec.forms[formId]))

  );

  const [onFormSuccessData, setOnFormSuccessData] = useState(undefined);

  const [onFormFailureData, setOnFormFailureData] = useState(undefined);

  const [encodedFormURI, setEncodedFormURI] = useState("");

  const [prefilledFormData, setPrefilledFormData] = useState();

  const [errorModal, setErrorModal] = useState(false);

  const [previewModal, setPreviewModal] = useState(false);

  const { state } = useContext(StateContext);

  let courseObj = undefined;

  const loading = useRef(false);

  const [assData, setData] = useState({

    district: "",

    instituteName: "",

    nursing: "",

    paramedical: "",

    type: "",

    latitude: null,

    longitude: null,

  });

  const getDataFromLocal = async () => {

    const id = user?.userRepresentation?.id;

    let formData = await getFromLocalForage(

      `${formName}_${new Date().toISOString().split("T")[0]}`

    );

    let fileGCPPath = GCP_URL + formName + ".xml";

    let formURI = await getPrefillXML(

      `${fileGCPPath}`,

      formSpec.onSuccess,

      formData?.formData || formData?.form_data,

      formData?.imageUrls

    );

    setEncodedFormURI(formURI);

  };

  const updateSubmissionForms = async (course_id) => {

    let submission_forms_arr = await getSpecificDataFromForage(

      "submission_forms_arr"

    );

    let formStatusCounter = 0;

    if (submission_forms_arr) {

      submission_forms_arr = Object.values(submission_forms_arr);

      submission_forms_arr = submission_forms_arr.map((elem) => {

        if (elem.course_id === course_id) {

          elem.form_status = true;

        }

        if (elem.form_status) {

          formStatusCounter++;

        }

        return elem;

      });

      setToLocalForage("submission_forms_arr", submission_forms_arr);

      updateApplicantForm(submission_forms_arr, formStatusCounter);

    }

  };

  const updateApplicantForm = (forms_arr, counter) => {

    if (forms_arr.length === counter) {

      // call the event update function...

      registerEvent({

        created_date: getLocalTimeInISOFormat(),

        entity_id: courseObj?.applicant_form_id.toString(),

        entity_type: "form",

        event_name: "OGA Completed",

        remarks: `${user?.userRepresentation?.firstName} ${user?.userRepresentation?.lasttName} has completed the On Ground Inspection Analysis`,

      });

      updateFormStatus({

        form_id: courseObj.applicant_form_id,

        form_status: "OGA Completed",

      });

    }

  };

  const getSurveyUrl = async () => {

    let surveyUrl = await getOfflineCapableForm(formId);

    console.log("SurveyURL:", surveyUrl);

    if (!surveyUrl)

      setSurveyUrl(

        "https://8065-samagradevelop-workflow-871i2twcw0a.ws-us98.gitpod.io/x"

      );

    else setSurveyUrl(surveyUrl);

  };

  async function afterFormSubmit(e, saveFlag) {

    const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;

    try {

      const { nextForm, formData, onSuccessData, onFailureData } = data;

      if (data?.state === "ON_FORM_SUCCESS_COMPLETED") {

        if (!previewFlag) {

          getDataFromLocal();

          handleRenderPreview();

        } else {

          // For read-only forms, it will disable the Submit...

          if (date) {

            setErrorModal(true);

            return;

          }

          const updatedFormData = await updateFormData(formSpec.start);

          const storedData = await getSpecificDataFromForage("required_data");

          const res = await saveFormSubmission({

            schedule_id: scheduleId.current,

            form_data: updatedFormData,

            assessment_type: "assessor",

            form_name: formSpec.start,

            submission_status: saveFlag === "draft" ? false : true,

            assessor_id: storedData?.assessor_user_id,

            applicant_id: storedData?.institute_id,

            submitted_on: new Date().toJSON().slice(0, 10),

            applicant_form_id: courseObj["applicant_form_id"],

            round: courseObj["round"],

            form_status: saveFlag === "draft" ? "" : "In Progress",

            course_id: courseObj["course_id"],

          });

          console.log("res - ", res);

          if (res?.data?.insert_form_submissions) {

            updateSubmissionForms(courseObj["course_id"]);

            // Delete the data from the Local Forage

            const key = `${storedData?.assessor_user_id}_${formSpec.start}_${new Date().toISOString().split("T")[0]

              }`;

            removeItemFromLocalForage(key);

            setPreviewModal(false);

            previewFlag = false;

            setTimeout(

              () => navigate(`${ROUTE_MAP.thank_you}${formName}`),

              1000

            );

          }

        }

      }

      if (nextForm?.type === "form") {

        setFormId(nextForm.id);

        setOnFormSuccessData(onSuccessData);

        setOnFormFailureData(onFailureData);

        setEncodedFormSpec(encodeURI(JSON.stringify(formSpec.forms[formId])));

        setEncodedFormURI(

          getFormURI(

            nextForm.id,

            onSuccessData,

            formSpec.forms[nextForm.id].prefill

          )

        );

        navigate(

          formName.startsWith("hospital")

            ? ROUTE_MAP.hospital_forms

            : ROUTE_MAP.medical_assessment_options

        );

      } else if (nextForm?.type === "url") {

        window.location.href = nextForm.url;

      }

    } catch (e) {

      console.log(e);

    }

  }

  const handleEventTrigger = async (e) => {

    handleFormEvents(startingForm, afterFormSubmit, e);
    handleFormLoadEvents(e);

  };

  const bindEventListener = () => {

    window.addEventListener("message", handleEventTrigger);

  };

  const detachEventBinding = () => {

    window.removeEventListener("message", handleEventTrigger);

  };

  const handleFormLoadEvents = (e) => {
    if (typeof e.data === 'string' && e.data.includes('formLoad')) {
      setFormLoaded(true);
      return;
    }
  }

  const checkIframeLoaded = () => {
    if (window.location.host.includes("localhost")) {
      return;
    }

    const iframeElem = document.getElementById("enketo-form");
    var iframeContent =
      iframeElem?.contentDocument || iframeElem?.contentWindow.document;
    var section = iframeContent?.getElementsByClassName("or-group");
    if (!section) return;
    for (var i = 0; i < section?.length; i++) {
      var inputElements = section[i].querySelectorAll("input");
      var buttonElements = section[i].querySelectorAll("button");
      buttonElements.forEach((button) => {
        if (date !== undefined) {
          button.disabled = true;
          iframeContent.getElementById("submit-form").style.display = "none";
          iframeContent.getElementById("save-draft").style.display = "none";
        }
      });
      inputElements.forEach((input) => {
        if (date !== undefined) {
          input.disabled = true;
          iframeContent.getElementById("submit-form").style.display = "none";
          iframeContent.getElementById("save-draft").style.display = "none";
        }
        // hide admin remarks
        if (input?.name?.toLowerCase().includes('admin') ) {
          input.previousSibling.style.display = 'none';
          input.style.display = 'none';
        }
      });

      // iframeContent.getElementById("submit-form").style.display = "none";
      // iframeContent.getElementById("save-draft").style.display = "none";
    }

    var draftButton = iframeContent.getElementById("save-draft");
    draftButton?.addEventListener("click", function () {
      //alert("Hello world!");
    });
  };

  const handleRenderPreview = () => {

    setPreviewModal(true);

    previewFlag = true;

    setTimeout(() => {

      const iframeElem = document.getElementById("preview-enketo-form");

      if (window.location.host.includes("localhost")) {

        return;

      }

      let iframeContent =

        iframeElem?.contentDocument || iframeElem?.contentWindow.document;

      if (!iframeContent) return;

      let section = iframeContent?.getElementsByClassName("or-group");

      if (!section) return;

      for (var i = 0; i < section?.length; i++) {

        var inputElements = section[i].querySelectorAll("input");

        inputElements.forEach((input) => {

          input.disabled = true;

        });

      }

      iframeContent.getElementById("save-draft").style.display = "none";

    }, 1500);

  };

  const getCourseFormDetails = async () => {

    let submission_forms_arr = await getSpecificDataFromForage(

      "submission_forms_arr"

    );

    if (submission_forms_arr) {

      submission_forms_arr = Object.values(submission_forms_arr);

      courseObj = submission_forms_arr.find(

        (obj) => obj.course_name === formName + ".xml"

      );

    }

  };

  /* fetch form data from API */
  const fetchFormData = async () => {
    let formData = {};
    let filePath =
      process.env.REACT_APP_GCP_AFFILIATION_LINK + formName + ".xml";
    const storedData = await getSpecificDataFromForage("required_data");
    let data = await getFromLocalForage(
      `${userId}_${formName}_${new Date().toISOString().split("T")[0]}`
    );
    const postData = { form_id: storedData?.applicant_form_id };
    try {
      const res = await getEnketoFormData(postData);
      formData = res.data.form_submissions[0];
      console.log(formData?.form_data)
      // setPaymentStatus(formData?.payment_status);
      const postDataEvents = { id: storedData?.applicant_form_id };
      // const events = await getStatusOfForms(postDataEvents);
      // setFormStatus(events?.events);
      setFormDataFromApi(res.data.form_submissions[0]);
      return formData?.form_data;
     /*  await setToLocalForage(
        `${userId}_${startingForm}_${new Date().toISOString().split("T")[0]}`,
        {
          formData: formData?.form_data,
          imageUrls: { ...formData?.imageUrls },
        }
      ); */
 
   /*    let formURI = await getPrefillXML(
        `${filePath}`,
        formSpec.onSuccess,
        formData?.form_data,
        formData?.imageUrls
      ); */
     // setEncodedFormURI(formURI);
    } catch (error) {
      console.log(error);
    } finally {
      // setSpinner(false);
    }
  };

  const asssssData = async () => {
    let formDataresp = await fetchFormData();
    //console.log(formDataresp)
    let request;
       let openRequest = window.indexedDB.open("enketo", 3);
    openRequest.onsuccess = function(e) {
      //let db = openRequest.result;
      var db =  e.target.result;
      var trans = db.transaction(["records"], 'readwrite'); //second step is opening the object store
        var store = trans.objectStore("records");
          console.log(store.getAll())
        request = store.get("__autoSave_apjkmlEX");
      console.log(request);
      console.log(request.result.xml);
      request.result.xml = formDataresp;
    //  setNewResult(request.result.xml)
    console.log(request.result.xml);
    };
     
    
  }

  
  const setNewResult = async (newFormData) => {

  }
  

  useEffect(() => {
    asssssData();

    bindEventListener();

    getSurveyUrl();

    getCourseFormDetails();

    getFormData({

      loading,

      scheduleId,

      formSpec,

      startingForm,

      formId,

      setData,

      setEncodedFormSpec,

      setEncodedFormURI,

    });

    setTimeout(() => {

      checkIframeLoaded();

    }, 2500);

    return () => {

      detachEventBinding();

      setData(null);

      setPrefilledFormData(null);

    };

  }, []);

  useEffect(() => {
    if (formLoaded === true) {
      checkIframeLoaded();
    }
  }, [formLoaded])

  /* 

  async function fetchIframeResources(iframeUrl) {

    try {

      const response = await fetch(iframeUrl);

      const text = await response.text();

      console.log(text); // The fetched content of the iframe

      // You can further process the fetched content as needed

    } catch (error) {

      console.error('Error fetching iframe resources:', error);

    }

  }

  setTimeout(() => {

    // Call the function with the URL of the iframe's content

    fetchIframeResources('https://enketo.upsmfac.org/enketo/preview?formSpec=%7B%22skipOnSuccessMessage%22:true,%22prefill%22:%7B%7D,%22submissionURL%22:%22%22,%22name%22:%22bsc_nursing_p7%22,%22successCheck%22:%22async%20(formData)%20=%3E%20%7B%20return%20true;%20%7D%22,%22onSuccess%22:%7B%22notificationMessage%22:%22Form%20submitted%20successfully%22,%22sideEffect%22:%22async%20(formData)%20=%3E%20%7B%20console.log(formData);%20%7D%22%7D,%22onFailure%22:%7B%22message%22:%22Form%20submission%20failed%22,%22sideEffect%22:%22async%20(formData)%20=%3E%20%7B%20console.log(formData);%20%7D%22,%22next%22:%7B%22type%22:%22url%22,%22id%22:%22google%22%7D%7D%7D&xform=https://formmanager.upsmfac.org/form/instance/48637fc6-d572-4700-a223-34582ce38538&userId=997e23bb-6801-44a1-aeb4-c3e526a85574');

    }, 2000); */

  return (

    <>

      <CommonLayout

        {...props.commonLayoutProps}

        formUrl={`${ENKETO_URL}/preview?formSpec=${encodedFormSpec}&xform=${encodedFormURI}&userId=${user?.userRepresentation?.id}`}

        formPreview={true}

        setIsPreview={setIsPreview}

      >

        {!isPreview && (

          <div className="flex flex-col items-center">

            {encodedFormURI && assData && date && (

              <>

                <iframe

                  title="form"

                  id="enketo-form"

                  src={`${ENKETO_URL}/preview?formSpec=${encodedFormSpec}&xform=${encodedFormURI}&userId=${user?.userRepresentation?.id}`}

                  style={{ height: "80vh", width: "100%" }}

                />

              </>

            )}

          </div>

        )}

        {surveyUrl && !date && (

          <>

            <iframe

              id="offline-enketo-form"

              title="form"

              src={surveyUrl}

              style={{ height: "80vh", width: "100%", marginTop: "20px" }}

            />

          </>

        )}

      </CommonLayout>

      {errorModal && (

        <CommonModal>

          <div>

            <p className="text-secondary text-2xl lg:text-3xl text-semibold font-medium text-center">

              Error!

            </p>

            <div className="flex flex-row justify-center w-full py-4 text-center">

              You can't submit a Preview form.

            </div>

            <div className="flex flex-row justify-center w-full py-4">

              <div

                className="border border-primary bg-primary text-white py-1 px-7 cursor-pointer lg:px-16 lg:py-3 lg:text-xl"

                onClick={() => setErrorModal(false)}

              >

                Close

              </div>

            </div>

          </div>

        </CommonModal>

      )}

      {previewModal && (

        <CommonModal

          moreStyles={{

            padding: "1rem",

            maxWidth: "95%",

            minWidth: "90%",

            maxHeight: "90%",

          }}

        >

          <div className="flex flex-row w-full items-center cursor-pointer gap-4">

            <div className="flex flex-grow font-bold text-xl">

              Preview and Submit form

            </div>

            <div className="flex flex-grow justify-end">

              <FontAwesomeIcon

                icon={faXmark}

                className="text-2xl lg:text-4xl"

                onClick={() => {

                  setPreviewModal(false);

                  previewFlag = false;

                }}

              />

            </div>

          </div>

          <div className="flex flex-col justify-center w-full py-4">

            {surveyUrl && (

              <iframe

                title="form"

                id="preview-enketo-form"

                src={`${ENKETO_URL}/preview?formSpec=${encodedFormSpec}&xform=${encodedFormURI}&userId=${user?.userRepresentation?.id}`}

                style={{ height: "80vh", width: "100%", marginTop: "20px" }}

              />

            )}

          </div>

        </CommonModal>

      )}

    </>

  );

};

export default GenericOdkForm;