const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    dateAdded: { type: Date, default: Date.now },
    name: String,
    meal: String,
    image_url: String,
    type: String,
    serving_qty: { type: Number, min: 0},
    serving_unit: String,
    nutritions: {
        calories: { type: Number, min: 0},
        total_fat: { type: Number, min: 0},
        saturated_fat: { type: Number, min: 0},
        cholesterol: { type: Number, min: 0},
        sodium: { type: Number, min: 0},
        total_carbohydrate: { type: Number, min: 0},
        dietary_fiber: { type: Number, min: 0},
        sugars: { type: Number, min: 0},
        protein: { type: Number, min: 0},
        potassium: { type: Number, min: 0},
    }
});

const LogSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    days: [{
        date: String,
        items: [ItemSchema]
    }]
})

var Log = mongoose.model('Log', LogSchema);

module.exports = Log;