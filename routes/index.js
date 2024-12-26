const authRouter = require('./Auth')
const usersRouter = require('./Users')
const AuditRouter = require('./AuditRoutes')
const JurusanRouter = require('./JurusanRoutes')

module.exports = {
    authRouter,
    usersRouter,
    AuditRouter,
    JurusanRouter
}