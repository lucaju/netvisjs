import {app} from './AppInstallConfig';

const init = () => {
	app.controller('InstallCtrl', ($scope, $http) => {

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

export default {
	init
};