var mongoose = require("mongoose");


//Save reference to Schema constructor
var Schema = mongoose.Schema;

//Create new UserSchema object
var ArticleSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    
    link: {
        type: String,
        required: true
    },

    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }

});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;

