const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

const formatAMPM = (date) => {
  var givenDate = new Date(date);
  var utcDate = new Date(givenDate.getTime() - 8 * 60 * 60 * 1000); // Adding 8 hours in milliseconds
  var hours = utcDate.getHours();
  var minutes = utcDate.getMinutes();
  var seconds = utcDate.getSeconds();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  var strTime = hours + ":" + minutes + ":" + seconds + " " + ampm;
  return strTime;
};

export { formatDate, formatAMPM };
