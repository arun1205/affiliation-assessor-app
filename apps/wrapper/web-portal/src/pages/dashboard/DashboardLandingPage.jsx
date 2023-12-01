import React, { useContext, useEffect, useState } from "react";

import Header from "../../components/Header";
import Nav from "../../components/Nav";
import FilteringTable from "../../components/table/FilteringTable";
import { ContextAPI } from "../../utils/ContextAPI";
import { Option, Select } from "@material-tailwind/react";
import {
  getDashBoardData,
  searchDashBoard
} from "../../api";

const DashboardLandingPage = (props) => {

  const { setSpinner } = useContext(ContextAPI);
  const [formsList, setFormsList] = useState();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [round, setRound] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    offsetNo: 0,
    limit: 10,
    totalCount: 0,
  });

  const formsDataList = [];


  const COLUMNS = [
    {
      Header: "Application ID",
      accessor: "application_id",
    },
    {
      Header: "Date",
      accessor: "date",
    },
    {
      Header: "Institute Name",
      accessor: "institute_name",
    },
    {
      Header: "Application type",
      accessor: "application_type",
    },
    {
      Header: "Course Type",
      accessor: "course_type",
    },
    {
      Header: "Form title",
      accessor: "form_name",
    },
    {
      Header: "City",
      accessor: "city",
    },
    {
      Header: "Status",
      accessor: "status",
    }
   
  ];


  useEffect(() => {
     if (!isSearchOpen && !isFilterOpen) {
      fetchDashBoardData(round);
     }
  }, [
    paginationInfo.offsetNo,
    paginationInfo.limit,
    round
  ]);


  const fetchDashBoardData = async (round) => {
    console.log(round)
    const postData = {
      offsetNo: paginationInfo.offsetNo,
      limit: paginationInfo.limit,
      round: round
    };
    try {
      setSpinner(true);
      const res = await getDashBoardData(postData);
      setPaginationInfo((prevState) => ({
        ...prevState,
        totalCount: res?.data?.form_submissions_aggregate.aggregate.totalCount,
      }));
     // console.log(res?.data?.form_submissions_aggregate.aggregate.totalCount)
   //   setOgaFormsCount(res?.data?.form_submissions_aggregate.aggregate.totalCount)
      setFormsList(res?.data?.form_submissions);
    } catch (error) {
      console.log("error - ", error);
    } finally {
      setSpinner(false);
    }
  };

  const filterApiCall = async (filters) => {
    let customFilters = {
      condition: {
     /*    ...filters["condition"],
        round: {
          _eq: selectedRound,
        },
        form_status: {
          _eq: state.menu_selected,
        },*/
      }, 
    };
    const postData = {
      offsetNo: paginationInfo.offsetNo,
      limit: paginationInfo.limit,
      ...customFilters,
    };
    try {
      setSpinner(true);
      const res = await getDashBoardData(postData);
      setPaginationInfo((prevState) => ({
        ...prevState,
        totalCount: res.data.form_submissions_aggregate.aggregate.totalCount,
      }));
      setFormsList(res?.data?.form_submissions);
    } catch (error) {
      console.log("error - ", error);
    } finally {
      setSpinner(false);
    }
  };



  const searchApiCall = async (searchData) => {
    const postData = {
      offsetNo: paginationInfo.offsetNo,
      limit: paginationInfo.limit,
      ...searchData
    };
    try {
      setSpinner(true);
      const res = await searchDashBoard(postData);
      setPaginationInfo((prevState) => ({
        ...prevState,
        totalCount: res.data.form_submissions_aggregate.aggregate.totalCount,
      }));
      setFormsList(res?.data?.form_submissions);
    } catch (error) {
      console.log("error - ", error);
    } finally {
      setSpinner(false);
    }
  };

  formsList?.forEach((e) => {
    var formsData = {
      application_id: e.form_id,
      date: e?.submitted_on || "-",
      application_type: e?.course_type || "-",
      course_type: e?.course_level || "-",
      // course_name: `${e?.course?.course_type} - ${e?.course?.course_level}` || "NA",
      institute_name: e?.institute.name || "-",
      id: e.form_id,
      form_name:e?.form_name,
      status: e?.form_status || "-",
      city:e?.institute.district || "-"
    };
    formsDataList.push(formsData);
  });

  const handleChange = async (round) => {
    fetchDashBoardData(round);
  }

  return (
    <>
      <Header/>
      
      <Nav />
      
      <div
        className={`container ; m-auto min-h-[calc(100vh-148px)] px-3 py-12`}
      >
        <div className="flex flex-col gap-8">

          <div className="flex flex-col gap-4">

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <div className="w-72 bg-white rounded-[8px]">
             
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <div className="w-72 bg-white rounded-[8px]">
                  <Select
                    value={round}
                    label="Select round"
                    onChange={(value) => {
                      handleChange(value);
                    /*   setPaginationInfo((prevState) => ({
                        ...prevState,
                        offsetNo: 0,
                      })); */
                      setIsFilterOpen(false);
                      setIsSearchOpen(false);
                    }}
                  >
                    <Option value={1}>Round one</Option>
                    <Option value={2}>Round two</Option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">

            {/* table creation starts here */}
            <div className="flex flex-col gap-4">
             
                <FilteringTable
                  dataList={formsDataList}
                  // navigateFunc={navigateToView}
                  navigateFunc={() => { }}
                  columns={COLUMNS}
                  pagination={true}
                  onRowSelect={() => { }}
                  filterApiCall={filterApiCall}
                  showFilter={true}
                  showSearch={true}
                  paginationInfo={paginationInfo}
                  setPaginationInfo={setPaginationInfo}
                  searchApiCall={searchApiCall}
                  setIsSearchOpen={setIsSearchOpen}
                  setIsFilterOpen={setIsFilterOpen}
                />
            </div>
          </div>
        </div>
      
      </div>
   
    </>
  );
};

export default DashboardLandingPage;


