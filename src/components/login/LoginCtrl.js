import {app} from '../../AppConfig';

const init = () => {
	app.controller('LoginCtrl', ($rootScope, $scope, $http, $mdColors) => {

		$scope.credentials = {
			email: '',
			password: ''
		};

		$scope.forgotPass = false;
		$scope.forgot = {};

		$scope.infoPanel = null;

		$scope.user = {
			id: 'guest',
			logged: false,
			credentials: null,
			level: 2
		};

		$scope.login = () => {

			$scope.credentials.action = 'checkCredentials';

			const req = {
				method: 'POST',
				url: 'api/user/login.php',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: $scope.credentials
			};

			$http(req).then( res => {

				if (!res.data) return;
				if (res.data.error)  {
					$scope.credentials.error = res.data.error;
					return;
				}

				$scope.credentials = res.data;
				$rootScope.$broadcast('credentials_accepted', res.data);

			}, res => {
				if (res.data.error)  {
					$scope.credentials.error = res.data.error;
				}
			});

		};

		$scope.submitEmail = () => {

			$scope.forgot.action = 'reset';

			const req = {
				method: 'POST',
				url: 'api/user/recover_password.php',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: $scope.forgot
			};

			$http(req).then( res => {

				if (!res.data) {
					$scope.forgot.error = 'Unable to process your request';
					return;
				}

				if (res.data.error)  {
					$scope.forgot.error = res.data.error;
					return;
				}

				$scope.forgot.error = null;
				$scope.forgot.success = true;
				$scope.forgot.msg = res.data.message;
				$scope.forgotPassword(false);

			}, res => {
				console.log(res);
				$scope.forgot.success = false;
				if (res.data && res.data.error)  {
					$scope.forgot.error = res.data.error;
					return;
				}
				$scope.forgot.error = 'Unable to process your request';
			});

		};

		$scope.forgotPassword = value => $scope.forgotPass = value;

		$scope.closeDialog = () => $rootScope.$broadcast('CloseLoginPanel');

	});
};

export default {
	init
};