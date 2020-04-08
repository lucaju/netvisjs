import angular from 'angular';
import {app} from '../../AppConfig';
import UserInfoEditCtrl from '../settings/user/UserInfoEditCtrl';

const init = () => {

	UserInfoEditCtrl.init();

	app.controller('SettingsCtrl', ($rootScope, $scope, $http, $mdPanel, $mdToast) => {

		$scope.usersAccountData = [];
		$scope.accountListItemOver = '';
		$scope.accountEditing = false;

		$scope.infoPanel = null;
		$scope.currentUser = null;

		let originalTitle = $scope.project.title;

		$scope.showEditUserPanel = user => {

			let action;

			//action
			if (!user) {
				user = {
					id: '-1'
				};
				action = 'create';
			} else {
				action = 'update';
			}

			//close opened panes
			if ($scope.infoPanel) $scope.infoPanel.close();

			//variables
			const locals = {
				action: action,
				user,
				currentUser: {
					level: $scope.currentUser.level
				},
				dataBaseReference: $scope.usersAccountData
			};

			//positions
			const position = $mdPanel.newPanelPosition()
				.relativeTo(document.querySelector('#main'))
				.addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.ALIGN_BOTTOMS);

			//animation
			const animation = $mdPanel.newPanelAnimation()
				.withAnimation({
					open: 'dialog-custom-animation-open',
					close: 'dialog-custom-animation-close'
				});

			//configurations
			const config = {
				id: user._id,
				animation: animation,
				attachTo: document.querySelector('#viz-port'),
				controller: 'UserInfoEditCtrl',
				templateUrl: 'components/settings/user/user.info.edit.html',
				locals: locals,
				panelClass: 'tag-info',
				position: position,
				trapFocus: false,
				zIndex: 80,
				hasBackdrop: true
			};

			//create and launch
			$scope.infoPanel = $mdPanel.create(config);
			$scope.infoPanel.open();

		};

		// ************ //

		$scope.showEditAccountButton = (itemID, value) => {
			$scope.accountListItemOver = (value ? itemID : undefined);
		};

		$scope.editAccountButtonVisibility = itemID => {
			return (itemID === $scope.accountListItemOver ? true : false);
		};

		$scope.getUserById = userID => {
			for (let i = 0; i < $scope.usersAccountData.length; i++) {
				if ($scope.usersAccountData[i]._id === userID) return $scope.usersAccountData[i];
			}
			return null;
		};

		// ************ //

		$scope.$on('loadSettings', (event, user) => {

			//re-define user
			$scope.currentUser = user;

			//events
			$scope.$on('userSigned', user => $scope.currentUser = user);

			//
			const titleField = document.getElementById('title-input');
			titleField.addEventListener('focusout', titleChange);

			//load data;
			if ($scope.usersAccountData.length === 0) loadUsers();

		});

		const titleChange = () => {
			if ($scope.project.title !== originalTitle) {
				originalTitle = $scope.project.title;
				updateMeta({title: $scope.project.title});
			}
		};

		const updateMeta = data => {
			const req = {
				method: 'PATCH',
				url: '/meta',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$rootScope.user.token}`
				},
				data
			};

			$http(req).then(res => {

				if (res.status === 503) return false;

				if (!res.data) {
					$scope.showSimpleToastTag('An error occurred!');
					return;
				}

				if (res.data.action === 'updated') {
					$scope.showSimpleToastTag('Updated.');
				}

			}, () => {
				$scope.showSimpleToastTag('An error occurred!');
			});
		};

		const loadUsers = () => {
			$http.get('/users', {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$rootScope.user.token}`
				}
			}).then(res => {
				if (res.status !== 200) return [];
				$scope.usersAccountData = res.data;
			}, () => {
				// console.log(res);
			});
		};

		$scope.$on('userAction', (event, {action,data}) => {

			$scope.infoPanel = null;

			if (action === 'create') {

				data.new = true;
				$scope.usersAccountData.push(data);

			} else if (action === 'update') {

				const user = $scope.getUserById(data._id);

				if (user !== null) {
					if (data.level !== null) user.level = data.level;
					if (data.email !== null) user.email = data.email;
					if (data.firstName !== null) user.firstName = data.firstName;
					if (data.lastName !== null) user.lastName = data.lastName;
					user.new = true;
				}

			} else if (action === 'delete') {

				const user = $scope.getUserById(data._id);

				if (user !== null) {
					const index = $scope.usersAccountData.indexOf(user);
					$scope.usersAccountData.splice(index, 1);
				}

			}
		});

		$scope.showSimpleToastTag = msg => {
			$mdToast.show(
				$mdToast.simple()
				.textContent(msg)
				.position('top center')
				.hideDelay(3000)
				.toastClass('toast-custom')
				.parent(angular.element(document.querySelector('#viz-port')))
			);

		};

	});
};

export default {
	init
};