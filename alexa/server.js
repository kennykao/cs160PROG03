'use strict'

var AlexaAppServer = require('alexa-app-server');

var server = AlexaAppServer.start({
	app_dir: 'apps',
	app_root: '',
	port: 8000
});