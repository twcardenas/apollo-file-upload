const mongoose = require('mongoose');

const descSchema = new mongoose.Schema({
  description: {
    type: String
  },
});

const Desc = mongoose.model('Desc', descSchema);

module.exports = Desc;