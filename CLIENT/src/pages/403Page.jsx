import React from "react";
import { Button } from "@nextui-org/react";
import { Link } from "@nextui-org/react";
import ParentInset from "../components/shared/ParentInset";

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-22-2024
 * PURPOSE/DESCRIPTION  : Redirects to this page if the url not found
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : UnAuthorizedPage
 *****************************************************************/
function UnAuthorizedPage() {
  return (
    <main className="grid place-items-center px-6 sm:py-48 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-600">403</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Permission Denied
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, you don't have enough permission to access this page
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button as={Link} color="primary" variant="ghost" href="/">
            Go back Home
          </Button>
        </div>
      </div>
    </main>
  );
}

export default UnAuthorizedPage;
