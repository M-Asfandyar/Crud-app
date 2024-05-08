const mongoose = require ('mongoose')

const AdminSchema = new mongoose.Schema({
  name: {
    type : String,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add an password'],
  }
},
{
  timestamps: true
})

const AdminModel = mongoose.model('admins',AdminSchema)

module.exports = AdminModel;