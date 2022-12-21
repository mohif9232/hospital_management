let moment = require("moment")

let date = moment().calendar()
const todayDate = new Date().toLocaleDateString()
let newDate = new Date()
newDate.setDate(newDate.getDate() + 1)
const tomorrowDate = newDate.toLocaleDateString()


console.log(todayDate)
console.log(tomorrowDate)
console.log(date)

module.exports = { todayDate, tomorrowDate }