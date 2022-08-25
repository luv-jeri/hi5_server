const { model } = require('mongoose');

const MessageSchema = require('../schema/message.schema');

const Message = model('message', MessageSchema);

module.exports = Message;
