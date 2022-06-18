require("express-async-errors")

const AppError = require("./utils/appError")
const migrationsRun = require("./database/sqlite/migrations")
const { response } = require("express");
const express = require("express");

const routes = require("./routes");


const app = express();
app.use(express.json())

app.use(routes)
migrationsRun()

app.use((error, request, response, next) => {

  if(error instanceof AppError){
    return response.status(error
      .statusCode).json({
        status: "error",
        message: error.message
      })
  }
  console.error(error)
  return response.status(500).json({
    status: "error",
    message: "Internal Server Error"
  })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`to na porta ${PORT}`);
})