import React, { useState } from "react";
import ROUTE_MAP from "../routing/routeMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import CommonLayout from "../components/CommonLayout";
import { getFieldName, readableDate } from "../utils/common";
import { getSpecificDataFromForage, setToLocalForage } from "../utils";
import { useNavigate, useParams } from "react-router-dom";

const PastSubmittedForms = () => {
  const [applicationData, setApplicationData] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  let { date, institute } = useParams();

  const handleNavigateToForms = (formObj) => {
    navigate(
      `${
        ROUTE_MAP.otherforms_param_formName +
        formObj?.form_name.trim() +
        "/" +
        date
      }`
    );
    setToLocalForage("selected_assessment_form", formObj);
  };

  const getPastInspectionForms = async () => {
    const forms = (await getSpecificDataFromForage("past_inspections"))[
      "assessment_schedule"
    ];
    setApplicationData(forms.filter((item) => item.date === date));
  };

  useState(() => {
    getPastInspectionForms();
  }, []);

  return (
    <CommonLayout
      back={ROUTE_MAP.past_inspections}
      logoutDisabled
      pageTitle="Past Inspection List"
      pageDesc={`Following are the forms submitted on ${readableDate(
        date
      )} to the ${institute}`}
    >
      <div className="w-full flex flex-col px-6">
        <div className="font-medium text-xl mb-4">Submitted forms:</div>
        {error && (
          <span className="text-white animate__animated animate__headShake bg-red-500 w-80 font-medium px-4 py-3 text-center mx-auto mb-6">
            {error}
          </span>
        )}
        <div
          className={`flex flex-col px-6h-[calc(100vh-214px)] overflow-y-auto gap-4 pb-5 ${
            !applicationData.length ? "justify-center" : ""
          }`}
        >
          {applicationData.length &&
            applicationData[0]["form_submissions"]?.map((form, idx) => {
              return (
                <div
                  key={idx}
                  className="border-b-[1px] border-t-[1px] border-l-[1px] border-r-[1px] border-primary px-4 bg-orange-500/10 py-0"
                >
                  <div key={idx} onClick={() => handleNavigateToForms(form)}>
                    <div className="flex flex-row gap-3 border-1 border-black py-4">
                      <div className="flex grow items-center">
                        <div className="text-[14px] font-medium uppercase">
                          {getFieldName(form.form_name)}
                        </div>
                      </div>
                      <div className="flex flex-row grow-0 items-center gap-4">
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="text-[16px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </CommonLayout>
  );
};

export default PastSubmittedForms;
