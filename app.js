"use strict";
/* global process */
/* global __dirname */
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. 
 *
 * Contributors:
 *   David Huffman - Initial implementation
 *******************************************************************************/
/////////////////////////////////////////
///////////// Setup Node.js /////////////
/////////////////////////////////////////
var express = require('express');
var session = require('express-session');
var compression = require('compression');
var serve_static = require('serve-static');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var url = require('url');
var async = require('async');
var google = require('googleapis');
var setup = require('./setup');
var cors = require("cors");
var fs = require("fs");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//// Set Server Parameters ////
var host = (process.env.VCAP_APP_HOST || setup.SERVER.HOST);
var port = (process.env.VCAP_APP_PORT || setup.SERVER.PORT);


////////  Pathing and Module Setup  ////////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('.html', require('jade').__express);
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use( serve_static(path.join(__dirname, 'public'), {maxAge: '1d', setHeaders: setCustomCC}) );							//1 day cache
app.use(session({secret:'Somethignsomething1234!test', resave:true, saveUninitialized:true}));
function setCustomCC(res, path) {
	if (serve_static.mime.lookup(path) === 'image/jpeg')  res.setHeader('Cache-Control', 'public, max-age=2592000');		//30 days cache
	else if (serve_static.mime.lookup(path) === 'image/png') res.setHeader('Cache-Control', 'public, max-age=2592000');
	else if (serve_static.mime.lookup(path) === 'image/x-icon') res.setHeader('Cache-Control', 'public, max-age=2592000');
}
// Enable CORS preflight across the board.
app.options('*', cors());
app.use(cors());

///////////  Configure Webserver  ///////////
app.use(function(req, res, next){
	var keys;
	console.log('silly', '------------------------------------------ incoming request ------------------------------------------');
	console.log('info', 'New ' + req.method + ' request for', req.url);
	req.bag = {};											//create my object for my stuff
	req.session.count = eval(req.session.count) + 1;
	req.bag.session = req.session;
	
	var url_parts = url.parse(req.url, true);
	req.parameters = url_parts.query;
	keys = Object.keys(req.parameters);
	if(req.parameters && keys.length > 0) console.log({parameters: req.parameters});		//print request parameters
	keys = Object.keys(req.body);
	if (req.body && keys.length > 0) console.log({body: req.body});						//print request body
	next();
});

//// Router ////
app.use('/', require('./routes/site_router'));

////////////////////////////////////////////
////////////// Error Handling //////////////
////////////////////////////////////////////
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
app.use(function(err, req, res, next) {		// = development error handler, print stack trace
	console.log("Error Handeler -", req.url);
	var errorCode = err.status || 500;
	res.status(errorCode);
	req.bag.error = {msg:err.stack, status:errorCode};
	if(req.bag.error.status == 404) req.bag.error.msg = "Sorry, I cannot locate that file";
	res.render('template/error', {bag:req.bag});
});

////////////// Launch //////////////
var server = app.listen(port, host);								//gogo application
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
server.timeout = 240000;																							// Ta-da.
console.log('info', '------------------------------------------ Server Up - ' + host + ':' + port + ' ------------------------------------------');
if(process.env.PRODUCTION) console.log('Running using Production settings');
else console.log('Running using Developer settings');




// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================
// ============================================================================================================================

// ============================================================================================================================
// 														Warning
// ============================================================================================================================

// ============================================================================================================================
// 														Entering
// ============================================================================================================================

// ============================================================================================================================
// 														Test Area
// ============================================================================================================================
var obc = require('./utils/obc-js');
obc.network('169.53.72.245', 33113, false);						//setup network connection for rest endpoint - (host, port, ssl)
obc.load('https://hub.jazz.net/git/averyd/cc_ex02/archive?revstr=master', 'chaincode_obc-js_demo', cb_ready);			//parse/load chaincode

function cb_ready(err, contract){
	contract.cc.details.path = 'https://hub.jazz.net/git/averyd/cc_ex02/chaincode_obc-js_demo';
	contract.cc.details.name = '484a65c0d87ceb7334c20b02fbc829fc1c5f910a5996ff8f65a81c5f947126dd23d68880192842a6350046404a59c1270414151b62852912828aeed289af61b3';
	//contract.cc.details.name = "b62951cecff17590d5211082345638ec3cabbf4ca49baf3e3ee9ddb0cd4707714ddfb4306c3dbd633bee6158b92ca2dd82347eb5df12c94e3a45e7833fea007d";
	//contract.cc.details.name = "c38ad7ee13e89382fcf39476204b0c583fc78ed28f36382f9eb5c363d737129c7ce919f969ebba04109a455a180301cfd7d20c77344c3e4cdfccdbb1c80b9502";
	obc.save();
	//console.log('contract details:', contract.cc.details);
	//contract.init();
	//contract.invoke(["a", "b", "5"]);
	//contract.init();
	//contract.cc.read('a', cb_next);
	//contract.cc.deploy('init',  ["a", "101", "b", "202"], cb_next);
	//contract.cc.read('a', cb_next);
	function cb_next(e, value){
		//contract.cc.read('a', cb_next2);
	contract.cc.write('a', (value + 1), cb_next2);
		//contract.invoke(["a", "b", "5"], cb_next2);
	}
	function cb_next2(){
		contract.cc.read('a');
		contract.cc.read('b');
	}
}