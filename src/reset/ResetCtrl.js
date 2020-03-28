import {resetApp} from './AppResetConfig';

const init = () => {
	resetApp.controller('ResetCtrl', ($scope, $http) => {
       
		$scope.request = {
			action: undefined,
			userID: undefined,
			reqID: undefined,
			title: 'Reset Password',
			label: 'New Password',
			status: 'loading'
		};
		
		
		$scope.getInitialData = async ({action,requestID}) => {

			console.log(action)

			$scope.request.action = action;
			$scope.request.reqID = requestID;

			//change content if create
			if ($scope.request.action === 'create') {
				$scope.request.title = 'Create Password';
				$scope.request.label = 'Password';
			}

			$http.get(`../api/user/request_password_reset.php?requestID=${requestID}`).then(res => {

				if (!res.data) {
					$scope.request.status = 'error';
					if (res.data.error) $scope.request.error = res.data.error;
					return;
				}

				if (res.data.expired) {
					$scope.request.status = 'expired';
					$scope.request.error = res.data.error;
					return;
				}

				if (res.data.error) {
					console.log(res)
					$scope.request.status = 'error';
					$scope.request.error = res.data.error;
					return;
				}
				
				$scope.request.status = 'editing';
				$scope.request.userID = res.data.userID;

			}, res => {
				$scope.request.status = 'error';
				$scope.request.error = res.data.error;
			});

		};
			
		$scope.submit = async () => {
			const data = {
				id: $scope.request.userID,
				password: $scope.request.password
			};

			const req = {
				method: 'POST',
				url: '../api/user/reset_password.php',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: data
			}

			$http(req).then( res => {

				if (!res.data) return;
				if (res.data.error)  {
					$scope.request.error = res.data.error;
					return;
				}

				$scope.request.status = 'done';

				setTimeout(() => {
					window.location.href = 'http://labs.fluxo.art.br/kias/';
				}, 6000);
				

			}, res => {
				console.log(res);
				if (res.data.error) $scope.credentials.error = res.data.error;
			});

		};
		
	});
}

export default {
	init
};