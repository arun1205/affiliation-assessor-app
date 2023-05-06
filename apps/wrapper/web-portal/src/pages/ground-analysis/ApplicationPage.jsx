import React, {useEffect, useState} from "react";
import { AiOutlineClose,AiOutlineCheck } from "react-icons/ai";

import NocModal from "./NocModal";
import StatusLogModal from "./StatusLogModal";

import { getFormData } from "../../api";


export default function ApplicationPage({ closeModal,closeStatusModal }) {

    const[openModel, setOpenModel] = useState(false)
    const[openStatusModel, setOpenStatusModel] = useState(false)

    const fetchFormData = async () => {
        const postData = {"date":"2023-05-05","assessor_id":"427d473d-d8ea-4bb3-b317-f230f1c9b2f7","applicant_id": 11};
        const res = await getFormData(postData);
        console.log('res - ', res);
    };

    useEffect(() => {
        fetchFormData();
    });

    return (
        <>
            {/* <Header/> */}
            <div className="flex bg-gray-100 flex-col w-full h-screen">
                <div className="container mx-auto">
                    <div className="flex flex-col py-12">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-2xl font-bold">
                                New Institute - BSC GNM
                            </h1>
                            <div className="flex gap-4 mt-4">
                                <button className="flex flex-wrap items-center justify-center gap-2 border border-gray-500 bg-white  text-gray-500 w-[140px] h-[40px] font-medium rounded-[4px]">Reject <span><AiOutlineClose/></span> </button>
                                <button onClick={()=>{setOpenModel(true)}} className="flex flex-wrap items-center justify-center gap-2 border border-gray-500 text-gray-500 bg-white w-[140px] h-[40px] font-medium rounded-[4px]">Approve <span><AiOutlineCheck/></span></button>
                                <div className="inline-block h-[40px] min-h-[1em] w-0.5 border opacity-100 dark:opacity-50"></div>
                                <button onClick={()=>{setOpenStatusModel(true)}} className="border border-gray-500 text-blue-600 bg-gray-100 w-[140px] h-[40px] font-medium rounded-[4px]">View status log</button>
                            </div>
                        </div>
                    </div>
                    { openModel && <NocModal closeModal={setOpenModel}/> }
                    { openStatusModel && <StatusLogModal closeStatusModal={setOpenStatusModel}/> }
                </div>
            </div>  
        </>
    )
}