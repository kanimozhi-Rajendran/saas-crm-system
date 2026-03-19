const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Ticket = require('./models/Ticket');
  try {
    const t = await Ticket.create({
      title: 'test',
      description: 'test',
      createdBy: new mongoose.Types.ObjectId()
    });
    console.log('SUCCESS:', t._id);
  } catch(e) {
    console.log('ERROR:', e.message);
    console.log('DETAILS:', JSON.stringify(e.errors));
  }
  process.exit();
});