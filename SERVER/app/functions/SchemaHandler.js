const err = require("../message/Error.json");
/****************************************************************
 * STATUS               : Done
 * DATE CREATED/UPDATED : 02-28-2024
 * PURPOSE/DESCRIPTION  : To Handle schema of table, field, data dynamically
 * PROGRAMMER           : Sean Cyril B. Rubio
 * FUNCTION NAME        : getSchema
 *****************************************************************/
function getSchema(table) {
  try {
    return require(`../schemas/${table}Schema`);
  } catch (error) {
    console.error(err.schemaNotFound, table);
    return null;
  }
}
// End of getSchema

module.exports = { getSchema };
