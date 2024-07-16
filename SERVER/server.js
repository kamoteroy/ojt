const app = require("./appExpress");
const { connectToDB } = require("./app/config/DbConfig");

const PORT = process.env.PORT || 3000;

// Connect to the database
connectToDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
