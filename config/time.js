const todayDate = new Date().toLocaleDateString()
let newDate = new Date()
newDate.setDate(newDate.getDate() + 1)
const tomorrowDate = newDate.toLocaleDateString()




module.exports = { todayDate, tomorrowDate }