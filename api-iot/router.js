const express = require('express');
const router = express.Router();
const constants = require('./constants');

const sensorController = require('./api/sensor');
const parkingSlot = require('./api/parkingSlot');

// Endpoint to update ParkingSlot availability
router.put(constants.contextURL + constants.api + constants.postUpdateSlot, parkingSlot.updateAvailable);

// POST endpoint to insert sensor readings: body { reading, type }
router.post(constants.contextURL + constants.api + '/sensor', sensorController.insertReading);

module.exports = router;
