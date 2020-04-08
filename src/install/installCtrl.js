import {app} from './AppInstallConfig';

const init = () => {
	app.controller('InstallCtrl', ($scope, $http) => {

		$scope.status = 'mongoDB';
		$scope.error;
		$scope.mongoDB = {
			host: '127.0.0.1',
			port: '27017',
			database: 'NetVis'
		};
		$scope.meta = {
			title: undefined,
			sendgridAPI: undefined
		};
		$scope.user = {
			email: undefined,
			password: undefined
		};

		$scope.getMongoDBDisable = () => {
			if (!$scope.mongoDB.host) return true;
			if (!$scope.mongoDB.port) return true;
			if (!$scope.mongoDB.database) return true;
			return false;
		};

		$scope.getMetaDisable = () => {
			if (!$scope.meta.title) return true;
			if (!$scope.user.email) return true;
			if (!$scope.user.password) return true;
			return false;
		};

		$scope.installDisable = () => {
			if (!$scope.meta.sendgridAPI) return true;
			return false;
		};

		$scope.getMongoDBInfo = () => sendDBTest($scope.mongoDB);
		$scope.getMetaInfo = () => $scope.status = 'emailService';
		$scope.install = () => install();

		$scope.init = () => sendDBTest();

		const sendDBTest = data => {

			$http({
				method: 'POST',
				url: '/meta/connect',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: data
			}).then(res => {

				//if monogoDb is not setup.
				if (res.data.mongoDBExists === false) return;

				//if credentials are accepted
				// if forms is filled correctly, move the next screen
				if (res.data.mongoDBReady === true) {
					$scope.error = false;
					$scope.status = 'meta';
					return;
				}

				//if instalation already exists: redirect to homepage
				setTimeout(() => {
					window.location.href = window.location.origin;
				}, 6000);
				return $scope.status = 'exist';

			}, () => {
				$scope.status = 'mongoDB';
				$scope.error = true;
			});
		};


		const install = () => {

			$http({
				method: 'POST',
				url: '/meta/install',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: {
					mongoDB: $scope.mongoDB,
					meta: $scope.meta,
					user: $scope.user
				}
			}).then(res => {

				$scope.error = false;
				$scope.status = 'success';

				$scope.meta.url = res.data.url;

				setTimeout(() => {
					window.location.href = $scope.meta.url;
				}, 5000);

			}, () => {
				$scope.error = true;
			});

		};

	});
};

export default {
	init
};