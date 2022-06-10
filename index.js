const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston'),
    expressWinston = require('express-winston');
const {format} = require("winston");

const app = express()
const port = 3000

app.use(bodyParser())
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            format: format.combine(
                format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
                format.align(),
                format.printf(
                    (info) =>
                        `${info.level} - ${[info.timestamp]} - ${info.message}`
                )
            ),
        })
    ],
    // format: winston.format.combine(
    //     winston.format.colorize(),
    //     winston.format.json()
    // ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "{{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
        return false;
    } // optional: allows to skip some log messages based on request and/or response
}));

app.use('/', require('./controllet/wallet'));

app.use('/nft', require('./controllet/nft'));

app.use('/users',require('./controllet/users'));

// // 错误请求的日志
// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console()
//     ]
// }));

app.listen(port,() => {
    console.log(`Server Port: ${port}`)
})




