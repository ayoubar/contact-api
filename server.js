const express = require('express')
const connectDB = require('./config/db')
const path = require('path')
const app = express();

// Connect Database
connectDB()

// Init Middlware
app.use(express.json({ extended: false}))




// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });




// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));


// Serve static assets in production
if(process.env.NODE_ENV === 'production') {
  // Set static Folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname,'client', 'build',' index.html')));
}




const PORT = process.env.PORT || 5000;

app.listen( PORT, () => console.log(`Server started on port ${PORT}`));

