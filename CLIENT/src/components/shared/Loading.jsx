import { CircularProgress } from "@nextui-org/react";
import React from "react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <CircularProgress
        aria-label="loading"
        color="primary"
        showValueLabel={true}
        style={{ transform: "scale(3.0)" }}
      />
    </div>
  );
}
