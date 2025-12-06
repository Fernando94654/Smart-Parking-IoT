const mysql = require('../database/MySQLMngr');

async function insertReading(req, res){
    try{
        const reading = (typeof req.body.lectura !== 'undefined') ? req.body.lectura : req.body.reading;
        const type = (typeof req.body.tipo !== 'undefined') ? req.body.tipo : req.body.type;

        if (typeof reading === 'undefined' || typeof type === 'undefined'){
            return res.status(400).json({ status: 'error', message: 'reading and type are required in body' });
        }

        const qResult = await mysql.insertSensor(String(type), String(reading));
        if (!qResult.getStatus()){
            throw qResult.getErr();
        }

        return res.status(201).json({ status: 'ok', id: qResult.getGenId(), rows: qResult.getRows() });
    } catch (error){
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message || error });
    }
}

module.exports = { insertReading };
