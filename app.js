const path = require('path');
const express = require('express');
const app = express();

// Serving static files
const root = __dirname;
app.use(express.static(path.join(root, 'public')));

// Parsing incoming req with JSON payloads
app.use(express.json());

// Parsing  incoming req with urlencoded payloads
app.use(express.urlencoded({ extended: false }));

// View engine
app.set('view engine', 'ejs');

// Routes
const index = require('./routes/index');
const _404 = require('./routes/_404');

app.use(index);
app.use(_404);

// Listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port... ${PORT}`);
});
