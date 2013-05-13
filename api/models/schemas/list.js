var mongoose = require('mongoose');

/**
 * `List` object is used to represent a user
 * list of tickets
 */
var List = new mongoose.Schema({
  name       : { type: String, required: true, trim: true },
  created    : { type: Date, default: Date.now, required: true },
  user       : { type: mongoose.Schema.Types.ObjectId, ref: 'User',
                 index: true, required: true },
  color      : { type: Number, required: true },
  tickets    : { type: [mongoose.Schema.Types.ObjectId], ref: 'Ticket', required: false }
});

/**
 * List.toClient(), returns the `list` in a native object that is
 * safe to send directly to the client.
 * @return {Object}
 */
List.methods.toClient = function(){
  return {
    id: this._id,
    name: this.name,
    user: this.user,
    color: this.color,
    tickets: this.tickets,
    created: this.created
  };
};


exports.List = mongoose.model('List', List);