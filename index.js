const { urlencoded } = require("express");
let express = require("express");
const { json } = require("sequelize");
const { port } = require("./config/constant");
let app = express();
let route = require("./route/user")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/", route)

app.listen(port, () => {
    console.log(`Connected to Server on ${port}`)
})