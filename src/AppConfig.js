import angular from 'angular';

require('angular-animate');
require('angular-material');
require('angular-messages');
require('angular-resource');
require('angular-sanitize');
require('v-accordion');

require('angular-material/angular-material.min.css');
require('v-accordion/dist/v-accordion.min.css');

require('./style.css');

import AppCtrl from './AppCtrl';

export const app = angular.module('app', [
	'ngMaterial',
	'ngAnimate',
	'ngMessages',
	'vAccordion',
	'ngResource',
	'ngSanitize',
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

app.directive('customChip', () => {
	return {
		restrict: 'EA',
		link: function (scope, elem, attrs) {
			// const chipTemplateClass = attrs.class;
			const mdChip = elem.parent().parent();
			mdChip.addClass(attrs.customChip);
		}
	};
});

AppCtrl.init();

export default {
	app
};