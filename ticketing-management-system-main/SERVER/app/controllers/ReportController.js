const Report = require("../models/ReportModel");
const err = require("../message/Error.json");
const { isRecordExist } = require("../functions/CheckRecord");
const success = require("../message/Success.json");
const { getSchema } = require("../functions/SchemaHandler");
const { isDefaultRecord } = require("../functions/DefaultRecords");

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 05-02-2024
 * PURPOSE/DESCRIPTION  : To get all record of the ticket reports
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getTicketReports
 *****************************************************************/
async function getTicketReports(req, res) {
  const { table } = req.params;
  try {
    const result = await Report.getTicketCount(table);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 05-02-2024
 * PURPOSE/DESCRIPTION  : To get getTicketReports by Id
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getTicketReportsById
 *****************************************************************/
async function getTicketReportsById(req, res) {
  const { table, id } = req.params;
  try {
    const result = await Report.getTicketCountById(table, id);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 05-02-2024
 * PURPOSE/DESCRIPTION  : To get all record in the database dynamically with its count
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getTicketReports
 *****************************************************************/
async function getMonthlyTicketReports(req, res) {
  const { table } = req.params;
  try {
    const result = await Report.getMonthlyTicketCounts(table);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 05-02-2024
 * PURPOSE/DESCRIPTION  : To get all getMonthlyTicketReports by Id
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getMonthlyTicketReportsById
 *****************************************************************/
async function getMonthlyTicketReportsById(req, res) {
  const { table, id } = req.params;
  try {
    const result = await Report.getMonthlyTicketCountsById(table, id);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 05-02-2024
 * PURPOSE/DESCRIPTION  : To get avg ratings
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getAvgRate
 *****************************************************************/
async function getAvgRate(req, res) {
  const { table } = req.params;
  try {
    const result = await Report.getAverageRate(table);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 05-09-2024
 * PURPOSE/DESCRIPTION  : To get avg ratings
 * PROGRAMMER           : Jay Mar P. Rebanda
 * FUNCTION NAME        : getAvgRateById
 *****************************************************************/
async function getAvgRateById(req, res) {
  const { table, id } = req.params;
  try {
    const result = await Report.getAverageRateById(table, id);
    if (result.length === 0) res.status(404).json({ message: err.error404 });
    else res.json(result);
  } catch (error) {
    console.error(err.getAllError, error);
    res.status(500).json({ message: err.defaultError });
  }
}

module.exports = {
  getTicketReports,
  getTicketReportsById,
  getMonthlyTicketReports,
  getAvgRate,
  getMonthlyTicketReportsById,
  getAvgRateById,
};
