const History = require("../models/HistoryModel");
const err = require("../message/Error.json");
const success = require("../message/Success.json");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-12-2024
 * PURPOSE/DESCRIPTION  : To get specific record in the database dynamically
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getRecord
 *****************************************************************/
async function getAuditTrail(req, res) {
  const { table, userId } = req.params;
  try {
    const result = await History.getHistory(table, userId);
    if (!result) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getAuditTrail

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 04-12-2024
 * PURPOSE/DESCRIPTION  : To get specific record in the database dynamically
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getAllAuditTrail
 *****************************************************************/
async function getAllAuditTrail(req, res) {
  const { table } = req.params;
  try {
    const result = await History.getAllHistory(table);
    if (!result) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getError, error);
    res.status(500).json({ message: err.defaultError });
  }
}
// End of getAllAuditTrail

module.exports = { getAuditTrail, getAllAuditTrail };
