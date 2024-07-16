const User = require("../models/UserModel");
const { isRecordExist } = require("../functions/CheckRecord");
const err = require("../message/Error.json");
const success = require("../message/Success.json");
const { getSchema } = require("../functions/SchemaHandler");
const { isDefaultRecord } = require("../functions/DefaultRecords");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-25-2024
 * PURPOSE/DESCRIPTION  : To get all record in the database dynamically
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getAllRecord
 *****************************************************************/
async function getAllRecord(req, res) {
  const { table } = req.params;
  try {
    const result = await User.getAll(table);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getAllRecord

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-25-2024
 * PURPOSE/DESCRIPTION  : To get specific record in the database dynamically
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getRecord
 *****************************************************************/
async function getRecord(req, res) {
  const { table, field, data } = req.params;
  try {
    const result = await User.get(table, field, data);
    if (table == "DeviceToken") {
      if (!result) res.status(200).json({ message: err.error404 });
      else res.json(result);
    } else {
      if (!result) res.status(404).json({ message: err.error404 });
      else res.json(result);
    }
  } catch (error) {
    console.error(err.getError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getRecord

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 03-14-2024
 * PURPOSE/DESCRIPTION  : To get add a record in the table
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : addRecord
 *****************************************************************/
async function addRecord(req, res) {
  const { table } = req.params;
  const recordData = req.body;
  const schema = getSchema(table);
  if (schema) {
    const { error } = schema.validate(recordData);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
  }
  const record = await isRecordExist(table, recordData);
  if (!record) {
    try {
      const newRecordId = await User.create(table, recordData);
      res.status(201).json({ message: success.added, Id: newRecordId });
    } catch (error) {
      console.error(err.addError, error);
      res.status(500).json({ message: err.defaultError });
    }
  } else {
    res.status(500).json({ message: err.alreadyExist });
  }
}
// End of addRecord

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-14-2024
 * PURPOSE/DESCRIPTION  : To get add a record with no Code in the table
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : addRecordNoCode
 *****************************************************************/
async function addRecordNoCode(req, res) {
  const { table } = req.params;
  const recordData = req.body;
  const schema = getSchema(table);
  if (schema) {
    const { error } = schema.validate(recordData);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
  }
  const record = await isRecordExist(table, recordData);
  if (!record) {
    try {
      const newRecordId = await User.createNoCode(table, recordData);
      res.status(201).json({ message: success.added, Id: newRecordId });
    } catch (error) {
      console.error(err.addError, error);
      res.status(500).json({ message: err.defaultError });
    }
  } else {
    res.status(500).json({ message: err.alreadyExist });
  }
}
// End of addRecordNoCode

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-21-2024
 * PURPOSE/DESCRIPTION  : To get add multiple record in the table
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : addMultipleRecord
 *****************************************************************/
async function addMultipleRecord(req, res) {
  const { table } = req.params;
  const recordsData = req.body;
  const schema = getSchema(table);

  if (schema) {
    for (const recordData of recordsData) {
      const { error } = schema.validate(recordData);
      if (error)
        return res.status(400).json({ message: error.details[0].message });
    }
  }
  const newRecordIds = [];
  try {
    for (const recordData of recordsData) {
      const record = await isRecordExist(table, recordData);
      if (!record) {
        const newRecordId = await User.create(table, recordData);
        newRecordIds.push(newRecordId);
      } else {
        return res.status(500).json({ message: err.alreadyExist });
      }
    }
    res.status(201).json({ message: success.added, Id: newRecordIds });
  } catch (error) {
    console.error(err.addError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of addMultipleRecord

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-14-2024
 * PURPOSE/DESCRIPTION  : To get add a record with no Code in the table
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : addRecordNoCode
 *****************************************************************/
async function addMultiplePermissionRecord(req, res) {
  const { RoleId, AccessRightIds, CreatedBy, UpdatedBy } = req.body;
  console.log("recordsData outside", req.body);

  try {
    const existingRecords = [];
    for (const AccessRightId of AccessRightIds) {
      const recordData = { RoleId, AccessRightId, CreatedBy, UpdatedBy };
      const schema = getSchema("Permission");
      if (schema) {
        const { error } = schema.validate(recordData);
        if (error) {
          return res.status(400).json({ message: error.details[0].message });
        }
      }
      const recordExists = await isRecordExist("Permission", recordData);
      if (recordExists) {
        existingRecords.push(recordExists);
      }
    }
    if (existingRecords.length > 0) {
      return res.status(409).json({
        message: "Records already exist",
        existingRecords: existingRecords,
      });
    }
    const newRecordId = await User.addRecordToPermissionTable(
      RoleId,
      AccessRightIds,
      CreatedBy,
      UpdatedBy
    );

    res.status(201).json({
      message: "Multiple records added to Permission table successfully.",
      Id: newRecordId,
    });
  } catch (error) {
    console.error("Error adding multiple records to Permission table:", error);
    res.status(500).json({
      message: "An error occurred while adding records to Permission table.",
    });
  }
}

// End of addMultipleRecord

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-27-2024
 * PURPOSE/DESCRIPTION  : To update a record in the database
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : updateRecord
 *****************************************************************/
async function updateRecord(req, res) {
  const { table, field, data } = req.params;
  const updatedData = req.body;
  const checkRecord = await isRecordExist(table, updatedData, data);
  if (!checkRecord) {
    try {
      const record = await User.get(table, field, data);
      if (!record) res.status(404).json({ message: err.error404 });
      else {
        await User.update(table, field, data, updatedData);
        res.status(200).json({ message: success.updated });
      }
    } catch (error) {
      console.error(err.updateError, error);
      res.status(500).json({ message: err.defaultError });
    }
  } else {
    res.status(500).json({ message: err.alreadyExist });
  }
}
// End of updateRecord

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-27-2024
 * PURPOSE/DESCRIPTION  : To delete all record in a table
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : deleteAllRecord
 *****************************************************************/
async function deleteAllRecord(req, res) {
  const { table } = req.params;
  try {
    const records = await User.getAll(table);
    const nonDefaultRecords = records.filter(
      (record) => !isDefaultRecord(table, record.Id)
    );
    console.log("none-default record", nonDefaultRecords);
    if (nonDefaultRecords.length === 0)
      res.status(404).json({ message: err.error404 });
    else {
      await User.deleteAll(table);
      res.status(200).json({ message: success.deleted });
    }
  } catch (error) {
    console.error(err.deleteError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of deleteAllRecord

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-27-2024
 * PURPOSE/DESCRIPTION  : To delete specific record in a table
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : deleteRecord
 *****************************************************************/
async function deleteRecord(req, res) {
  const { table, field, data } = req.params;
  const record = await User.get(table, field, data);

  try {
    console.log("Default record", isDefaultRecord(table, record.Id));
    if (!record) res.status(404).json({ message: err.error404 });
    else if (isDefaultRecord(table, record.Id))
      res.status(400).json({ message: err.errDelDefault });
    else {
      await User.delete(table, field, data);
      res.status(200).json({ message: success.deleted });
    }
  } catch (error) {
    if (
      error.originalError &&
      error.code === "EREQUEST" &&
      error.originalError.info.number === 547
    ) {
      if (table == "Role" || table == "Department") {
        res.status(400).json({ message: `${record.Name} is currently in use` });
      } else if (table == "User") {
        res
          .status(400)
          .json({ message: `${record.Username} is currently in use` });
      } else if (table == "Product") {
        res.status(400).json({ message: `${record.Name} is currently in use` });
      }
    } else {
      res.status(500).json({ message: err.defaultError });
    }
  }
}
// End of deleteRecord

module.exports = {
  getAllRecord,
  getRecord,
  addRecord,
  addRecordNoCode,
  addMultipleRecord,
  addMultiplePermissionRecord,
  updateRecord,
  deleteAllRecord,
  deleteRecord,
};
