require("express-async-errors")

let errorhandler = (error, req, res, next) => {
    let status = 505
    let data = {
        message: "Internal server error",
        originalError: error.message
    }
    return res.status(status).send({ status: "fail", error: data });
}

module.exports = { errorhandler }