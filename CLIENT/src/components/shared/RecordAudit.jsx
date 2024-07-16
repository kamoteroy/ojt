import axiosInstance from "./axiosInstance";

const addAuditTrail = async (UserId, Action, Record, RecordTable) => {
  try {
    const payload = {
      UserId,
      Action,
    };

    if (Record !== null) {
      payload.Record = Record;
    }
    if (RecordTable !== null) {
      payload.RecordTable = RecordTable;
    }

    const response = await axiosInstance.post("/addaudit/AuditTrail", payload);
    console.log(response.data);
  } catch (error) {
    console.error("Error adding audit trail data:", error);
    throw error;
  }
};

export default addAuditTrail;
