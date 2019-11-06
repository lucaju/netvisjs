/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"main": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/independent_components/install/AppInstallConfig.js","vendors~main"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/independent_components/install/AppInstallConfig.js":
/*!****************************************************************!*\
  !*** ./src/independent_components/install/AppInstallConfig.js ***!
  \****************************************************************/
/*! exports provided: app, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "app", function() { return app; });
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! angular */ "./node_modules/angular/index.js");
/* harmony import */ var angular__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(angular__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _installCtrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./installCtrl */ "./src/independent_components/install/installCtrl.js");


__webpack_require__(/*! angular-material */ "./node_modules/angular-material/index.js");
__webpack_require__(/*! angular-messages */ "./node_modules/angular-messages/index.js");
__webpack_require__(/*! angular-resource */ "./node_modules/angular-resource/index.js");

__webpack_require__(/*! angular-material/angular-material.min.css */ "./node_modules/angular-material/angular-material.min.css");
__webpack_require__(/*! ./install.css */ "./src/independent_components/install/install.css");



const app = angular__WEBPACK_IMPORTED_MODULE_0___default.a.module('app', [
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

_installCtrl__WEBPACK_IMPORTED_MODULE_1__["default"].init();


/* harmony default export */ __webpack_exports__["default"] = ({
	app
});

/***/ }),

/***/ "./src/independent_components/install/install.css":
/*!********************************************************!*\
  !*** ./src/independent_components/install/install.css ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/independent_components/install/installCtrl.js":
/*!***********************************************************!*\
  !*** ./src/independent_components/install/installCtrl.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _AppInstallConfig__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AppInstallConfig */ "./src/independent_components/install/AppInstallConfig.js");


const init = () => {
	_AppInstallConfig__WEBPACK_IMPORTED_MODULE_0__["app"].controller('InstallCtrl', ($scope, $http) => {

		$scope.status = '';
		$scope.error;
		$scope.database = {
			name: undefined,
			user: undefined,
			password: undefined
		}
		$scope.project = {
			title: undefined,
			url: undefined,
			sendGridAPI: undefined
		}
		$scope.user = {
			email: undefined,
			password: undefined
		}

		$scope.getDatabaseDisable = () => {
			if (!$scope.database.name) return true;
			if (!$scope.database.user) return true;
			if (!$scope.database.password) return true;
			return false;
		};

		$scope.getProjectDisable = () => {
			if (!$scope.project.title) return true;
			// if (!$scope.project.url) return true;
			if (!$scope.user.email) return true;
			if (!$scope.user.password) return true;
			return false;
		};

		$scope.installDisable = () => {
			if (!$scope.project.sendGridAPI) return true;
			return false;
		};

		$scope.getDatabaseInfo = () => sendDBTest();
		$scope.getProjectInfo = () => $scope.status = 'emailService';
		$scope.install = () => install();
		
		$scope.init = () => {
			sendDBTest();
		}

		const sendDBTest = () => {

			const req = {
				method: 'POST',
				url: '../api/shared/test_db.php',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: $scope.database
			}

			$http(req).then( res => {

				if(res.status !== 200) $scope.error = true;

				//if instalation already exists
				if(res.data.env === true) {
					console.log(window.location);
					$scope.status = 'exist';
				}
				
				// if forms is filled correctly
				if ($scope.database.name && $scope.database && $scope.database) {
					$scope.error = false;
					$scope.status = 'project';
				}

			}, res => {
				if ($scope.status === 'database') $scope.error = true;
				$scope.status = 'database';
			});

		};


		const install = () => {

			const req = {
				method: 'POST',
				url: 'install.php',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: {
					database: $scope.database,
					project: $scope.project,
					user: $scope.user
				}
			}

			$http(req).then( res => {
				$scope.error = false;
				$scope.status = 'success';

				console.log(res);
				$scope.project.url = res.data.metadata.url

				setTimeout(() => {
					window.location.href = $scope.project.url ;
				}, 5000);

			}, res => {
				// console.log(res)
				$scope.error = true;
			});

		};
		
	});
}

/* harmony default export */ __webpack_exports__["default"] = ({
	init
});

/***/ })

/******/ });