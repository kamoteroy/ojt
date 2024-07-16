const { sql } = require("../config/DbConfig");

function formatResolutionTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = "";
  if (days > 0) formattedTime += `${days} day${days !== 1 ? "s" : ""} `;
  if (hours > 0) formattedTime += `${hours} hr `;
  if (minutes > 0) formattedTime += `${minutes} min `;
  if (remainingSeconds > 0) formattedTime += `${remainingSeconds} sec`;
  return formattedTime.trim();
}

function formatMonthYear(year, month) {
  const months = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May.",
    "June.",
    "July.",
    "Aug.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dec.",
  ];
  return `${months[month - 1]} ${year}`;
}

const Report = {
  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 04-21-2024
   * PURPOSE/DESCRIPTION  : To get all counts in ticket as well as their averageresolution time
   * PROGRAMMER           : Jay Mar P. Rebanda
   * FUNCTION NAME        : getTicketCount
   *****************************************************************/
  async getTicketCount(table) {
    const query = `
      SELECT 
        COUNT(*) AS totalTickets,
        AVG(CASE WHEN DoneDate IS NOT NULL THEN DATEDIFF(second, DoneDate, DateCreated) END) AS AVGResolutionTimeInSeconds,
        SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS OngoingCount,
        SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS SolvedCount
      FROM [${table}]
    `;
    const result = await sql.query(query);
    const totalCount =
      result.recordset.length > 0 ? result.recordset[0].totalCount : 0;
    const records = result.recordset.map((record) => {
      record.AVGResolutionTime = formatResolutionTime(
        record.AVGResolutionTimeInSeconds
      );
      delete record.AVGResolutionTimeInSeconds;
      return record;
    });
    return { totalCount, records };
  },

  // End of getTicketCount

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 04-21-2024
   * PURPOSE/DESCRIPTION  : To get all counts in ticket as well as their averageresolution time
   * PROGRAMMER           : Jay Mar P. Rebanda
   * FUNCTION NAME        : getTicketCount
   *****************************************************************/
  async getTicketCountById(table, id) {
    const query = `
        SELECT 
          COUNT(*) AS totalTickets,
          AVG(CASE WHEN DoneDate IS NOT NULL THEN DATEDIFF(second, DoneDate, DateCreated) END) AS AVGResolutionTimeInSeconds,
          SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS OngoingCount,
          SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS SolvedCount
        FROM [${table}]
        WHERE AssignedBy = '${id}'

      `;
    const result = await sql.query(query);
    const totalCount =
      result.recordset.length > 0 ? result.recordset[0].totalCount : 0;
    const records = result.recordset.map((record) => {
      record.AVGResolutionTime = formatResolutionTime(
        record.AVGResolutionTimeInSeconds
      );
      delete record.AVGResolutionTimeInSeconds;
      return record;
    });
    return { totalCount, records };
  },

  // End of getTicketCountById

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 04-21-2024
   * PURPOSE/DESCRIPTION  : To get all counts in ticket as well as their averageresolution time
   * PROGRAMMER           : Jay Mar P. Rebanda
   * FUNCTION NAME        : getMonthlyTicketCounts
   *****************************************************************/
  async getMonthlyTicketCounts(table) {
    const query = `
      SELECT 
        YEAR(DoneDate) AS Year,
        MONTH(DoneDate) AS Month,
        COUNT(*) AS TotalTickets,
        SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS SolvedCount,
        AVG(DATEDIFF(MINUTE, DateCreated, DoneDate)) AS AvgResolutionTimeMinutes
      FROM [${table}]
      WHERE DoneDate >= DATEADD(MONTH, -6, GETDATE()) AND (DoneDate IS NOT NULL OR Status = 0)
      GROUP BY YEAR(DoneDate), MONTH(DoneDate)
      ORDER BY Year DESC, Month DESC;
    `;
    const result = await sql.query(query);
    const monthlyCounts = result.recordset.map((record) => {
      const avgResolutionMinutes = record.AvgResolutionTimeMinutes;
      const avgResolutionDays = Math.floor(avgResolutionMinutes / (24 * 60));
      const avgResolutionHours = Math.floor(
        (avgResolutionMinutes % (24 * 60)) / 60
      );
      const avgResolutionMinutesRemainder = avgResolutionMinutes % 60;
      const avgResolutionTime = `${avgResolutionDays} days, ${avgResolutionHours} hours, ${avgResolutionMinutesRemainder} minutes`;
      return {
        monthYear: formatMonthYear(record.Year, record.Month),
        totalTickets: record.TotalTickets,
        ongoingCount: record.TotalTickets - record.SolvedCount,
        solvedCount: record.SolvedCount,
        avgResolutionTime: avgResolutionTime,
      };
    });
    return monthlyCounts;
  },
  // End of getMonthlyTicketCounts

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 05-03-2024
   * PURPOSE/DESCRIPTION  : To get all counts in ticket as well as their averageresolution time by Id
   * PROGRAMMER           : Jay Mar P. Rebanda
   * FUNCTION NAME        : getMonthlyTicketCountsById
   *****************************************************************/
  async getMonthlyTicketCountsById(table, id) {
    const query = `
        SELECT 
          YEAR(DoneDate) AS Year,
          MONTH(DoneDate) AS Month,
          COUNT(*) AS TotalTickets,
          SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS SolvedCount,
          AVG(DATEDIFF(MINUTE, DateCreated, DoneDate)) AS AvgResolutionTimeMinutes
        FROM [${table}]
        WHERE DoneDate >= DATEADD(MONTH, -6, GETDATE()) AND (DoneDate IS NOT NULL OR Status = 0)
        AND AssignedBy = '${id}'
        GROUP BY YEAR(DoneDate), MONTH(DoneDate)
        ORDER BY Year DESC, Month DESC;
      `;
    const result = await sql.query(query);
    const monthlyCounts = result.recordset.map((record) => {
      const avgResolutionMinutes = record.AvgResolutionTimeMinutes;
      const avgResolutionDays = Math.floor(avgResolutionMinutes / (24 * 60));
      const avgResolutionHours = Math.floor(
        (avgResolutionMinutes % (24 * 60)) / 60
      );
      const avgResolutionMinutesRemainder = avgResolutionMinutes % 60;
      const avgResolutionTime = `${avgResolutionDays} days, ${avgResolutionHours} hours, ${avgResolutionMinutesRemainder} minutes`;
      return {
        monthYear: formatMonthYear(record.Year, record.Month),
        totalTickets: record.TotalTickets,
        ongoingCount: record.TotalTickets - record.SolvedCount,
        solvedCount: record.SolvedCount,
        avgResolutionTime: avgResolutionTime,
      };
    });
    return monthlyCounts;
  },
  // End of getMonthlyTicketCountsById

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 05-03-2024
   * PURPOSE/DESCRIPTION  : To get the Average SatisfactionRate
   * PROGRAMMER           : Jay Mar P. Rebanda
   * FUNCTION NAME        : getRateCount
   *****************************************************************/
  async getAverageRate(table) {
    const query = `
      SELECT 
        SUM(SatisfactoryRate) AS TotalSatisfactoryRate,
        COUNT(*) AS TotalRecords
      FROM [${table}]
    `;
    const result = await sql.query(query);
    const totalSatisfactoryRate =
      result.recordset.length > 0
        ? result.recordset[0].TotalSatisfactoryRate
        : 0;
    const totalRecords =
      result.recordset.length > 0 ? result.recordset[0].TotalRecords : 0;
    const averageRate =
      totalRecords > 0 ? totalSatisfactoryRate / totalRecords : 0;
    const roundedAverageRate = parseFloat(averageRate.toFixed(2));
    return {
      totalSatisfactoryRate,
      totalRecords,
      averageRate: roundedAverageRate,
    };
  },
  // End of getRateCount

  /****************************************************************
   * STATUS               : Done
   * DATE CREATED/UPDATED : 05-09-2024
   * PURPOSE/DESCRIPTION  : To get the Average SatisfactionRate
   * PROGRAMMER           : Jay Mar P. Rebanda
   * FUNCTION NAME        : getRateCount
   *****************************************************************/
  async getAverageRateById(table, id) {
    const query = `
    SELECT 
    SUM(SatisfactoryRate) AS TotalSatisfactoryRate,
    COUNT(*) AS TotalRecords
    FROM [${table}] TotalRecords
    INNER JOIN Ticket ON TotalRecords.TicketId = Ticket.Id
    WHERE Ticket.AssignedBy = '${id}'
      `;

    const result = await sql.query(query);
    const totalSatisfactoryRate =
      result.recordset.length > 0
        ? result.recordset[0].TotalSatisfactoryRate
        : 0;
    const totalRecords =
      result.recordset.length > 0 ? result.recordset[0].TotalRecords : 0;
    const averageRate =
      totalRecords > 0 ? totalSatisfactoryRate / totalRecords : 0;
    const roundedAverageRate = parseFloat(averageRate.toFixed(2));
    return {
      totalSatisfactoryRate,
      totalRecords,
      averageRate: roundedAverageRate,
    };
  },
  // End of getRateCount
};

module.exports = Report;
