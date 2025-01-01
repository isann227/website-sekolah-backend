const authRouter = require('./Auth')
const usersRouter = require('./Users')
const AuditRouter = require('./AuditRoutes')
const JurusanRouter = require('./JurusanRoutes')
const EkskulRouter = require('./EkskulRoutes')
const VisimisiRouter = require('./VisimisiRoutes')

module.exports = {
    authRouter,
    usersRouter,
    AuditRouter,
    JurusanRouter,
    EkskulRouter,
    VisimisiRouter
}