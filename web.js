var express = require('express'),
    app = express.createServer(express.logger()),
    fs = require('fs'),
    path = require('path'),
    buffer,
    content
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
    //response.send('Hello World2!');
    content = fs.readFileSync('./index.html').toString('utf-8')
    res.end(content)
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
