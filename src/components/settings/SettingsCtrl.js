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
		$scope.sendgridAPI = null;

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
				id: user.id,
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
				if ($scope.usersAccountData[i].id === userID) return $scope.usersAccountData[i];
			}
			return null;
		};

		// ************ //

		$scope.$on('loadSettings', (event,user) => {

			//re-define user
			$scope.currentUser = user;

			//events
			$scope.$on('userSigned', user => $scope.currentUser = user);

			//
			const titleField = document.getElementById('title-input');
			const sendgridField = document.getElementById('sendgrid-input');
			titleField.addEventListener('focusout', titleChange);
			sendgridField.addEventListener('focusout', sendgridChange);

			//load data;
			if ($scope.usersAccountData.length === 0) loadUsers();
			if ($scope.sendgridAPI === null) loadsendgridAPI();

		});

		const titleChange = () => {
			if ($scope.project.title !== originalTitle) {
				originalTitle = $scope.project.title;
				updateMeta({title: $scope.project.title});
			}
		};

		const sendgridChange = e => {
			if ($scope.sendgridAPI !== e.target.value) {
				$scope.sendgridAPI = e.target.value;
				updateMeta({sendgridAPI: $scope.sendgridAPI});
			}
		};

		const updateMeta = data => {
			const req = {
				method: 'POST',
				url: 'api/meta/update.php',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data
			};

			$http(req).then( res => {

				if (res.status === 503) return false;

				if (!res.data) {
					$scope.showSimpleToastTag('An error occurred!');
					return;
				}

				if (res.data.action === 'updated') {
					$scope.showSimpleToastTag('Updated.');
				}
				

			}, res => {
				$scope.showSimpleToastTag('An error occurred!');
			});
		};

		const loadUsers = () => {
			$http.get('api/user/read.php').then( res => {
				if (res.status !== 200) return [];
				$scope.usersAccountData = res.data;
			}, res => {
				// console.log(res);
			});
		};

		const loadsendgridAPI = () => {
			$http.get('api/meta/read_sendgrid.php').then( res => {
				if (res.status !== 200) return;
				$scope.sendgridAPI = res.data.sendgridAPI;
			}, res => {
				// console.log(res);
			});
		};

		$scope.$on('userAction', (event,userData) => {
			
			$scope.infoPanel = null;
			
			if (userData.action === 'created') {

				userData.new = true;
				$scope.usersAccountData.push(userData);

			} else if (userData.action === 'updated') {

				const user = $scope.getUserById(userData.id);

				if (user !== null) {
					if (userData.level !== null) user.level = userData.level;
					if (userData.email !== null) user.email = userData.email;
					if (userData.first !== null) user.first = userData.first;
					if (userData.last !== null) user.last = userData.last;
					user.new = true;
				}

			} if (userData.action === 'deleted') {

				const user = $scope.getUserById(userData.id);

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