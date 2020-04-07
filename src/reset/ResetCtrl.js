import {resetApp} from './AppResetConfig';

const init = () => {
	resetApp.controller('ResetCtrl', ($scope, $http) => {

		$scope.page = {
			action: undefined,
			userID: undefined,
			token: undefined,
			url: undefined,
			title: 'NetVis',
			header: 'Reset Password',
			label: 'New Password',
			status: 'loading'
		};

		const getQueryData = () => {
			const data = {};

			let searches = window.location.search;
			searches = searches.substring(1, searches.length);
			searches = searches.split('&');

			for (let item of searches) {
				item = item.split('=');
				data[item[0]] = item[1];
			}

			$scope.page.action = data.action;
			$scope.page.userID = data._id;
			$scope.page.token = data.token;
		};

		const updatePage = meta => {
			$scope.page.title - meta.title;
			$scope.page.url = meta.url;
			document.title = $scope.page.title;
		};

		$scope.getInitialData = () => {

			//get query data
			getQueryData();

			//change content if create
			if ($scope.page.action === 'create') {
				$scope.page.header = 'Create Password';
				$scope.page.label = 'Password';
			}

			$http.get(`/reset/request?_id=${$scope.page.userID}&action=${$scope.page.action}&token=${$scope.page.token}`).then(res => {

				if (!res.data) {
					$scope.page.status = 'error';
					if (res.data.error) $scope.page.error = res.data.error;
					return;
				}

				updatePage(res.data.meta);

				$scope.page.status = 'editing';
				$scope.page.userID = res.data.user._id;

			}, error => {

				updatePage(error.data.meta);

				$scope.page.status = error.data.status;
				$scope.page.error = error.data.message;
			});

		};

		$scope.submit = () => {
			const data = {
				_id: $scope.page.userID,
				password: $scope.page.password
			};

			$http({
				method: 'POST',
				url: '/reset/reset',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: data
			}).then(() => {

				$scope.page.status = 'done';

				setTimeout(() => {
					window.location.href = $scope.page.url;
				}, 6000);

			}, () => {
				$scope.credentials.error = 'Unable to reset password.';
			});

		};

	});
};

export default {
	init
};