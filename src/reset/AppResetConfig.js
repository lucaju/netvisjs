import angular from 'angular';

require('angular-material');
require('angular-messages');
require('angular-resource');

require('angular-material/angular-material.min.css');
require('./reset-password.css');

import ResetCtrl from './ResetCtrl';

export const resetApp = angular.module('resetApp', [
	'ngMaterial',
	'ngMessages',
	'ngResource'
]);

resetApp.config($mdThemingProvider => {
	$mdThemingProvider.theme('appTheme')
		.primaryPalette('grey', {
			'default': '800'
		})
		.accentPalette('blue')
		.warnPalette('orange', {
			'default': '800'
		});
});

ResetCtrl.init();


export default {
	resetApp
};