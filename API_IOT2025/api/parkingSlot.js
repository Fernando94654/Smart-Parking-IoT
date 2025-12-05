const post = require('../database/postMngr');

async function updateAvailable(req, res){
    try{
        const { id, available } = req.body;
        if (typeof id === 'undefined' || typeof available === 'undefined'){
            return res.status(400).json({ status: 'error', message: 'id and available are required in body' });
        }

        const qResult = await post.updateParkingSlotAvailable(id, available);
        if (!qResult.getStatus()){
            throw qResult.getErr();
        }

        return res.status(200).json({ status: 'ok', data: qResult.getRows() });
    } catch (error){
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message || error });
    }
}

module.exports = { updateAvailable };
