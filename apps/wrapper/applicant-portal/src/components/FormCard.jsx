import React from "react";
import { Card, Button } from "./index";

const FormCard = (props) => {
  let name = props?.form?.course_name;
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <Card moreClass="flex flex-col border-gray-100 m-3 gap-3 w-[300px] border-[1px] drop-shadow justify-between">
      <div className="text-xl font-medium">{name}</div>
      <div
        className="text-sm truncate ... cursor-pointer"
        title={props?.form?.course_desc}
      >
        {props?.form?.course_desc}

      </div>
      <div className="flex" >
        <span className={"text-teal-400 text-sm"}>
          Round : {props?.form?.round}
        </span>
      </div>
      <div className="flex">
        <Button
          moreClass="text-primary-500 font-bold uppercase border-gray-500 text-primary-400"
          style={{ backgroundColor: "#fff" }}
          text="Apply"
          onClick={props.onApply ? () => props.onApply(props?.form) : null}
        ></Button>
      </div>
    </Card>
  );
};

export default FormCard;
