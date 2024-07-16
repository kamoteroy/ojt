import React from "react";
import ToasterUtils from "./ToasterUtils";

const TestAuditNotification = () => {
  const { showMessage } = ToasterUtils();

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(`/createuser/User`, data);

      const recordId = response.data.Id;

      // Add Audit record
      // addAuditTrail (currentUserId,
      // Action/AccessRight like ("AddUser", "DeleteUser", etc.),
      // Id sa gihilabtan like Id (Primary key) sa inyo gi editrecord, Id sa gidelete nga record etc., if getAllRecord kay okay ra null)
      // Table name sa gihilabtan or gi view.
      await addAuditTrail(currentUserId, "AddUser", recordId, "User");

      // showing success message
      // showMessage (content or message, type sa toaster like "success","error","info","warn")
      showMessage(`${response.data.message}`, "success");

      // ORRRRR
      showMessage("Record Added Successfully", "success");
    } catch (error) {
      console.log("Message", error.response.data.message);
      setExist(error.response.data.error);
      showMessage(`${error.response.data.message}`, "error");

      if (error.response.data.message == "Record Already Exist") {
        setError("Username", {
          type: "manual",
          message: "Username already exist",
        });
      } else {
        console.error("Error adding user:", error);
      }
    }
  };

  return (
    <div>
      <div>
        <Button>Click to show message</Button>
      </div>
    </div>
  );
};

export default TestAuditNotification;
