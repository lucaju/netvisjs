import angular from 'angular';

require('angular-material');
require('angular-messages');
require('angular-resource');

require('angular-material/angular-material.min.css');
require('./install.css');

import installCtrl from './installCtrl';

export const app = angular.module('app', [
	'ngMaterial',
	'ngMessages',
	'ngResource'
]);

app.config($mdThemingProvider => {
	$mdThemingProvider.theme('appTheme')
		.primaryPalette('grey', {
			'default': '800'
		})
		.accentPalette('blue')
		.warnPalette('orange', {
			'default': '800'
		});
});

installCtrl.init();


export default {
	app
};