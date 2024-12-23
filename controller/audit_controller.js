const db = require('../db.js');

const addAuditLog = async (userId, role, action_made, nama_lengkap) => {
    try {
        const tanggalDibuat = new Date(); 
        const result = await db.query(
            'INSERT INTO audit (id, role, action_made, nama_lengkap, status) VALUES ($1, $2, $3, $4, $5) RETURNING id_audit',
            [userId, role, action_made, nama_lengkap, false]
        );
        return result.rows[0]; 
    } catch (error) {
        console.error('Error inserting into audit table:', error);
        throw error;
    }
};

const getAuditLogs = async () => {
  try {
      const result = await db.query('SELECT * FROM audit  WHERE status = false ORDER BY tanggal_dibuat DESC'); 
      return result.rows;
  } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
  }
};

const updateAuditStatus = async (startDate, endDate) => {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const result = await db.query(
            `UPDATE audit 
             SET status = true 
             WHERE tanggal_dibuat >= $1 AND tanggal_dibuat <= $2 AND status = false`,
            [start, end]
        );

        return result.rowCount;
    } catch (error) {
        console.error('Error updating audit status:', error);
        throw error;
    }
};

const getAllAuditLogs = async () => {
    try {
        const result = await db.query('SELECT * FROM audit ORDER BY tanggal_dibuat DESC');
        return result.rows;
    } catch (error) {
        console.error('Error fetching all audit logs:', error);
        throw error;
    }
};

module.exports = {
    addAuditLog,
    getAuditLogs,
    updateAuditStatus,
    getAllAuditLogs,
};
