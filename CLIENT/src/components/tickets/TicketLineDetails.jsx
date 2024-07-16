import React, { useEffect, useState } from "react";
import { Button, Divider, Image, Input, Textarea } from "@nextui-org/react";

const TicketLineDetails = () => {
  const [selectedTime, setSelectedTime] = useState("00:00");

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="flex flex-row text-2xl font-bold uppercase">
        Ticket Line
      </div>
      <Divider />
      <div className="flex-row py-3 uppercase font-bold pb-14">
        {/* Primary Information */}
      </div>
      <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-6 pb-6">
          {/* <label htmlFor="timePicker">Select a time:</label> */}
          <Input
            type="date"
            placeholder="Date Called"
            label="Date Called"
            readOnly
            // {...register("dateCalled", {
            //   required: "Date Called is required",
            // })}
          />
          <Input
            type="time"
            // id="dateCalledTimePicker"
            label="Time Called"
            value={selectedTime}
            readOnly
            // onChange={handleTimeChange}
            // {...register("timeCalled", {
            //   required: "Time called is required",
            // })}
          />
          <Input
            type="date"
            placeholder="Date Finished"
            label="Date Finished"
            readOnly
            // {...register("dateFinished", {
            //   required: "Date Finished is required",
            // })}
          />
          <Input
            type="time"
            // id="dateFinishedTimePicker"
            label="Time Finished"
            value={selectedTime}
            readOnly
            // onChange={handleTimeChange}
            // {...register("timeFinished", {
            //   required: "Time finished is required",
            // })}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <Textarea
          maxRows={3}
          type="text"
          label="Action"
          readOnly
          // {...register("Action", {
          //       required: "Action is required",
          // })}
        />
      </div>
    </>
  );
};

export default TicketLineDetails;
