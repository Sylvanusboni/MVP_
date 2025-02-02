const mongoose = require('mongoose');
const {User} = require('./models/appModel');

const MONGO_URI = "mongodb+srv://bryansambieni19:R00jAKvBIbJAXcGl@cluster0.q38xs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const updateUsers = async () => {
  try {
    // Update all users who don't have a `status` field, setting it to `active`
    const result = await User.updateMany(
      { role: { $exists: false } }, // Match users without the `status` field
      { $set: { role: 'user' } }  // Set `status` to `active`
    );

    console.log(`Updated ${result.modifiedCount} users to have a role of 'user'.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
updateUsers();
