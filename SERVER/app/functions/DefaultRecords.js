const { AccessRight } = require("../models/PermissionModel");

const defaultRecords = {
  User: [2],
  Role: [5],
  Department: [2],
  Product: [1, 2, 3],
  AccessRight: [
    1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022,
    1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034,
    1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045, 1046,
    1047, 1048, 1049, 1050, 1051, 1055, 1056, 1057, 1058, 1059, 1060, 1061,
    1064, 1065, 1067, 1068, 1070, 1071, 1072, 1073, 1074, 1075, 2074, 2075,
  ],
};

function isDefaultRecord(table, id) {
  return defaultRecords[table] && defaultRecords[table].includes(id);
}

module.exports = {
  isDefaultRecord,
};
