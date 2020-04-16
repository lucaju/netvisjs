import angular from 'angular';
import generatePassword from 'password-generator';

import {app} from '../../../AppConfig';


const init = () => {

	app.controller('UserInfoEditCtrl', function (
		$rootScope,
		$scope,
		$mdPanel,
		$mdToast,
		$mdBottomSheet,
		$window,
		$http,
		mdPanelRef) {

		$scope.mdPanelRef = mdPanelRef;
		$scope.mdBottomSheet;

		$scope.action = this.action;
		$scope.currentUserLevel = this.user.level;

		const dataBaseReference = this.dataBaseReference;

		$scope.payload;

		if ($scope.action === 'create') {
			this.user.level = 2;
			this.user.emailInvitation = true;
		} else {
			this.user.emailInvitation = false;
		}

		//copy
		$scope.user = angular.copy(this.user);
		$scope.originalUser = angular.copy(this.user);

		//---------    

		$scope.saveDisable = () => {
			let value = true;
			if (!angular.equals($scope.originalUser, $scope.user)) value = false;
			return value;
		};

		//https://github.com/bermi/password-generator
		$scope.generateUserPassword = () => {
			$scope.user.password = generatePassword(12, false);
		};

		//---------- Save // Delete
		$scope.saveUser = () => {
			if (!$scope.saveDisable() && $scope.user.level !== undefined) {

				$scope.payload = checkChanges();

				$scope.payload._id = $scope.user._id;

				$scope.payload.action = $scope.action;
				$scope.payload.invitation = $scope.user.emailInvitation;

				const duplicated = checkForDuplication($scope.payload);

				if (duplicated) {
					$scope.showSimpleToastTag(`The ${$scope.payload.email} is aready  being used!`);
					return;
				}

				//PASSWORD
				if ($scope.action === 'create') {
					//generate password if field is empty
					if ($scope.user.password === '') $scope.user.password = generatePassword(12, false);
					$scope.payload.password = $scope.user.password;
					
				} else if ($scope.action === 'update') {
					if (!$scope.user.password) $scope.payload.password = $scope.user.password;
				}

				submitData($scope.payload);

			}

		};

		const checkForDuplication = payload => {

			let check = false;
			if ($scope.action === 'create') check = true;
			if (payload.email !== undefined) check = true;

			if (check) {
				for (let i = 0; i < dataBaseReference.length; i++) {
					if (dataBaseReference[i].email.toLowerCase() === payload.email.toLowerCase()) {
						return true;
					}
				}
			}

			return false;
		};

		const checkChanges = () => {

			const PL = {
				id: $scope.user._id
			};

			// --- checks
			PL.level = $scope.user.level;
			if ($scope.user.email !== $scope.originalUser.email) PL.email = $scope.user.email;

			if ($scope.user.firstName !== $scope.originalUser.firstName) PL.firstName = $scope.user.firstName;
			if ($scope.user.lastName !== $scope.originalUser.lastName) PL.lastName = $scope.user.lastName;

			return PL;

		};

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

		$scope.deleteUser = () => {
			$scope.alert = '';
			$mdBottomSheet.show({
				templateUrl: 'components/dialog/bottom-sheet-confirm-delete-dialog.html',
				scope: $scope,
				preserveScope: true,
				// controller: 'TagInfoEditCtrl',
				clickOutsideToClose: false,
				parent: angular.element(document.querySelector('#tag-card-editing'))
			});
		};

		$scope.confirmDeleteTag = () => {
			// Action
			$mdBottomSheet.cancel();

			$scope.payload = {
				_id: $scope.user._id,
				action: 'delete'
			};

			submitData($scope.payload);
		};

		// Actions
		$scope.cancelDialog = () => $mdBottomSheet.cancel();

		const submitData = payload => {

			const action = payload.action;

			const request = {
				url: '/users',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$rootScope.user.token}`
				}
			};

			if (action === 'create') {
				request.method = 'POST';
				delete payload._id;
			} else if (action === 'update') {
				request.method = 'PATCH';
				request.url += `/${payload._id}`;
			} else if (action === 'delete') {
				request.method = 'DELETE';
				request.url += `/${payload._id}`;
			}

			//clean payload
			delete payload._id;
			delete payload.id;
			delete payload.action;
			delete payload.invitation;

			request.data = payload;

			$http(request).then(res => {

				if (res.status === 400 || res.status === 500) return false;

				if (!res.data) {
					$scope.showSimpleToastTag('An error occurred!');
					return;
				}

				let msg;

				if (action === 'delete') {
					msg = 'User removed.';
				} else if (action === 'create') {
					msg = 'User added.';
					if ($scope.payload.invitation) msg += ' An invitation was sent by email.';
				} else {
					msg = 'User updated.';
				}

				$scope.showSimpleToastTag(msg);

				$scope.mdPanelRef.close();
				$rootScope.$broadcast('userAction', {
					action,
					data: res.data
				});

			}, () => {
				$scope.showSimpleToastTag('An error occurred!');
			});
		};

		//---------- Close
		$scope.closeDialog = () => $scope.mdPanelRef.close();

		//---------- Resize
		$scope.eventResize = () => $scope.updatePosition();

		$scope.updatePosition = () => {
			const position = $mdPanel.newPanelPosition()
				.relativeTo(document.querySelector('#main'))
				.addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.ALIGN_BOTTOMS);

			$scope.mdPanelRef.updatePosition(position);
		};

		$window.addEventListener('resize', $scope.eventResize);

	});

};

export default {
	init
};