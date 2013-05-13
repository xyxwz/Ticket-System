var mongoose = require('mongoose');

/**
 * `Project` is used to represent a global
 * collection or tickets.
 */
var Project = new mongoose.Schema({
  name       : { type: String, required: true, trim: true },
  description: { type: String, default: '', required: false, trim: true },
  created    : { type: Date, default: Date.now, required: true },
  user       : { type: mongoose.Schema.Types.ObjectId,
                 ref: 'User', index: true, required: true },
  tickets    : { type: [mongoose.Schema.Types.ObjectId], ref: 'Ticket', required: false }
});

/**
 * `Project.toClient()`, returns the `project` in a native object that is
 * safe to send directly to the client.
 * @return {Object}
 */
Project.methods.toClient = function(){
  return {
    id: this._id,
    name: this.name,
    user: this.user,
    description: this.description,
    tickets: this.tickets,
    created: this.created
  };
};


exports.Project = mongoose.model('Project', Project);