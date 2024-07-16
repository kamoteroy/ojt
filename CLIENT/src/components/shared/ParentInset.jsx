import React from "react";

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-22-2024
 * PURPOSE/DESCRIPTION  : Parent Insetbackground of every page
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : ParentInset
 *****************************************************************/
function ParentInset({ children }) {
  return (
    <div className="relative isolate pt-2 min-h-fit">
      {children} {/* <!-- Content  */}
      {/* BG Inset */}
      <div
        className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-tr from-lightblue via-lightred to-darkblue opacity-10" />
      </div>
    </div>
  );
}

export default ParentInset;
