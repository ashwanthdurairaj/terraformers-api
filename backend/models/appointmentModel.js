const mongoose = require('mongoose')

const appointmentSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add title'],
    },
    agenda: {
      type: String,
      required: [true, 'Please add an agenda'],
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please add a guest'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
    },
    startTime:{
        type: String,
        required: [true, 'Please add start time'],
    },
    endTime:{
        type: String,
        required: [true, 'Please add end time'],
    }
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Appointment', appointmentSchema)
