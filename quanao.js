const mongoose = require('mongoose');

const QuanAoSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    picture: {
        type: String
        
    },
    price: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    }
});

const QuanAoModel = new mongoose.model('quanaos', QuanAoSchema); 

module.exports = QuanAoModel;