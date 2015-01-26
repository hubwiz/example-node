var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    models = require('./models');

for (var m in models) {
    mongoose.model(m, new Schema(models[m]));
}
module.exports = {
    getModel: function (type) {
        return _getModel(type);
    }
};

var _getModel = function (type) {
    return mongoose.model(type);
};


