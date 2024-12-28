const error_log_controller = require('./error_log')
const users_controller = require('./users_controller');
const audit_controller = require( './audit_controller')
const token_controller = require('./token_controller')
const jurusan_controller = require('./jurusan_controller')
const ekskul_controller = require('./ekskul_controller')

module.exports = {
    error_log_controller,
    users_controller,
    audit_controller,
    token_controller,
    jurusan_controller,
    ekskul_controller,
};