import { fork } from 'child_process';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';


const app = express();
const port = 3924;
app.set('port', port);
app.use(bodyParser.json())
app.use(cors());

app.get('/get-node', function(req, res) {
    let username = req.body.username;
    console.log(req.params);
    console.log(req.body);
    
    var child = fork('src/index.js' , [username]);
    child.on('message', (m) => {
        console.log('PARENT on port:', m);
        res.send(m);
        });
    return;

});

app.listen(app.get('port'), function () {
    console.log(`Provider listening on port ${app.get('port')}!`);
  });