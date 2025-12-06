const express = require('express');
const cors = require('cors');
const router = require('./router');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(router);

app.get('/', (req, res) => {
    res.send('Smart Parking IoT Server running');
});

app.listen(port, "0.0.0.0", () => {
    console.log('Server running on port: ' + port);
});
