import angular from 'angular';

import {app} from '../../AppConfig';

const init = () => {

	app.controller('TagInfoEditCtrl', function (
		$rootScope,
		$scope,
		$mdPanel,
		$mdToast,
		$mdBottomSheet,
		$window,
		$http,
		mdPanelRef) {

		$scope.action = this.action;

		$scope.mdPanelRef = mdPanelRef;
		$scope.userType = this.user.type;
		$scope.tag = angular.copy(this.tag);
		$scope.originalTag = angular.copy(this.tag);
		$scope.relations = this.tag.relations;

		$scope.payload;

		const dataBaseReference = this.dataBaseReference;

		$scope.tagLinkColoredChip = false;

		$scope.departments = [];
		$scope.researchers = [];
		$scope.interests = [];

		$scope.mdBottomSheet;

		$scope.relationToDelete = [];
		$scope.relationToAdd = [];

		//separate relations
		// angular.forEach($scope.relations, relation => {
		if ($scope.relations) {
			for (const relation of $scope.relations) {
				if (relation.type === 'Department') $scope.departments.push(relation);
				if (relation.type === 'Researcher') $scope.researchers.push(relation);
				if (relation.type === 'Interest') $scope.interests.push(relation);
			}
		}

		$scope.tagRelationChipTypeStyle = ({type}) => {
			//  console.log($mdColors.getThemeColor('accent'));
			if ($scope.tagLinkColoredChip) {

				switch (type) {
					case 'Department':
						return 'chipAccent';

					case 'Interest':
						return 'chipPrimary';

					case 'Researcher':
						return 'chipWarn';

					default:
						return null;
				}

			} else {
				return 'custom-chip-style';
			}

		};

		$scope.saveDisable = () => {
			let value = true;
			if (!angular.equals($scope.originalTag, $scope.tag)) value = false;
			if ($scope.relationToDelete.length > 0 || $scope.relationToAdd.length > 0 && value) value = false;
			return value;
		};

		//--------- chips

		const tagsLowercase = () => {
			let tags = _tagDatabase;

			return tags.map(tag => {
				tag._lowername = tag.name.toLowerCase();
				tag._lowertype = tag.type.toLowerCase();
				return tag;
			});

		};

		$scope.selectedTagRelation = null;
		const _tagDatabase = this.dataTag;
		$scope.tagDatabase = tagsLowercase();

		const createFilterFor = (query, type) => {
			const lowercaseQuery = query.toLowerCase();

			return tag => {
				if (tag.type === type) {
					return (tag._lowername.indexOf(lowercaseQuery) === 0) ||
						(tag._lowertype.indexOf(lowercaseQuery) === 0);
				}
			};

		};

		$scope.queryTagRelation = (query, type) => {
			const results = query ? $scope.tagDatabase.filter(createFilterFor(query, type)) : [];
			return results;
		};

		$scope.addNewRelation = (chip, source) => {
			let repeated = false;
			// angular.forEach($scope.relations, function(relation) {
			angular.forEach(source, relation => {
				if (chip._id === relation._id) repeated = true;
			});

			if (repeated) return null;

			$scope.relationToAdd.push(chip);
			$scope.updatePosition();
		};


		//---------- Save // Delete

		const checkForDuplication = payload => {

			let check = false;
			if ($scope.action === 'add') check = true;
			if (payload.name !== undefined) check = true;

			if (check) {
				for (let i = 0; i < dataBaseReference.length; i++) {
					if (dataBaseReference[i].name.toLowerCase() === payload.name.toLowerCase() &&
						dataBaseReference[i].type.toLowerCase() === payload.type.toLowerCase()) {
						return true;
					}
				}
			}

			return false;
		};

		const checkChanges = () => {

			const PL = {
				id: $scope.tag._id,
				type: $scope.tag.type
			};

			// --- checks

			if ($scope.tag.type === 'Researcher') {

				//first & last Name
				if ($scope.tag.first !== $scope.originalTag.first) PL.first = $scope.tag.first;
				if ($scope.tag.last !== $scope.originalTag.last) PL.last = $scope.tag.last;

				//Name
				if ($scope.tag.first !== $scope.originalTag.first ||
					$scope.tag.last !== $scope.originalTag.last) {

					if ($scope.tag.first !== undefined) PL.name = $scope.tag.first;

					if ($scope.tag.last !== undefined) {
						if (PL.name !== undefined) {
							PL.name += ' ' + $scope.tag.last;
						} else {
							PL.name = $scope.tag.last;
						}
					}
					if (PL.name === undefined) PL.name = undefined;
				}


			} else {
				//Name
				if ($scope.tag.name !== $scope.originalTag.name) PL.name = $scope.tag.name;
				PL.first = '';
				PL.last = '';
			}

			//website
			if ($scope.tag.type === 'Researcher') {
				if ($scope.tag.website !== $scope.originalTag.website) PL.website = $scope.tag.website;
			} else {
				PL.website = '';
			}

			//weight
			if ($scope.tag.weight !== $scope.originalTag.weight) PL.weight = $scope.tag.weight;


			///relation to delete
			if ($scope.relationToDelete.length > 0) {
				if (PL.relationToDelete === undefined) PL.relationToDelete = [];
				angular.forEach($scope.relationToDelete, rel => {
					PL.relationToDelete.push(rel._id);
				});
			}

			if ($scope.tag.type !== $scope.originalTag.type) {
				if ($scope.tag.type === 'Researcher') {
					angular.forEach($scope.originalTag.relations, rel => {

						if (rel.type === 'Researcher') {
							if (PL.relationToDelete === undefined) {
								PL.relationToDelete = [];
								PL.relationToDelete.push(rel._id);

							} else {

								for (let i = 0; i < PL.relationToDelete.length; i++) {

									if (rel._id === PL.relationToDelete[i]) {
										break;
									} else {
										PL.relationToDelete.push(rel._id);
									}
								}
							}
						}
					});


				} else {
					angular.forEach($scope.originalTag.relations, rel => {

						if (rel.type === 'Department' || rel.type === 'Interest') {
							if (PL.relationToDelete === undefined) {
								PL.relationToDelete = [];
								PL.relationToDelete.push(rel._id);

							} else {

								for (let i = 0; i < PL.relationToDelete.length; i++) {

									if (rel._id === PL.relationToDelete[i]) {
										break;
									} else {
										PL.relationToDelete.push(rel._id);
									}
								}
							}

						}
					});

				}

			}

			//relation to add
			if ($scope.tag.type === 'Researcher') {

				if ($scope.relationToAdd.length > 0) {
					angular.forEach($scope.relationToAdd, rel => {
						if (rel.type === 'Department' || rel.type === 'Interest') {
							if (PL.relationToAdd === undefined) PL.relationToAdd = [];
							PL.relationToAdd.push(rel._id);
						}
					});
				}

			} else {

				if ($scope.relationToAdd.length > 0) {
					angular.forEach($scope.relationToAdd, rel => {
						if (rel.type === 'Researcher') {
							if (PL.relationToAdd === undefined) PL.relationToAdd = [];
							PL.relationToAdd.push(rel._id);
						}
					});
				}

			}

			return PL;

		};

		$scope.saveTag = () => {

			if (!$scope.saveDisable() && $scope.tag.type !== undefined) {

				$scope.payload = checkChanges();
				$scope.payload.action = $scope.action;

				const duplicated = checkForDuplication($scope.payload);

				if (duplicated) {
					if ($scope.payload.type === 'Researcher') {
						$scope.duplicateTag();
					} else {
						$scope.showSimpleToastTag(`The ${$scope.payload.type} ${$scope.payload.name} is aready in the database!`);
					}

				} else {
					submitData($scope.payload);
				}

			}

		};

		$scope.deleteRelation = chip => {
			if ($scope.relationToDelete.length > 0) {
				for (let i = 0; i < $scope.relationToDelete.length; i++) {
					if ($scope.relationToDelete[i] === chip) {
						break;
					} else {
						$scope.relationToDelete.push(chip);
					}
				}
			} else {
				$scope.relationToDelete.push(chip);
			}
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

		$scope.duplicateTag = () => {
			$scope.alert = '';
			$mdBottomSheet.show({
				templateUrl: 'components/dialog/bottom-sheet-confirm-duplicate-dialog.html',
				scope: $scope,
				preserveScope: true,
				// controller: 'TagInfoEditCtrl',
				clickOutsideToClose: false,
				parent: angular.element(document.querySelector('#tag-card-editing'))
			});
		};

		$scope.deleteTag = () => {
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

		$scope.confirmDuplicate = () => {
			// Action
			submitData($scope.payload);
			$mdBottomSheet.cancel();
		};

		const cleanPayload = data => {
			if (data.type === 'Department') {
				delete data.first;
				delete data.last;
			} else if (data.type === 'Interest') {
				delete data.first;
				delete data.last;
				delete data.website;
			}
			delete data.action;
			return data;
		};

		const submitData = payload => {

			const action = payload.action;

			const request = {
				url: '/nodes',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: `Bearer ${$rootScope.user.token}`
				}
			};

			if (action === 'add') {
				request.method = 'POST';
				delete payload.id;
			} else if (action === 'update') {
				request.method = 'PATCH';
				request.url += `/${payload.id}`;
			} else if (action === 'remove') {
				request.method = 'DELETE';
				request.url += `/${payload.id}`;
			}

			request.data = cleanPayload(payload);


			$http(request).then(res => {

				if (res.status === 500 || res.status === 404) {
					$scope.showSimpleToastTag('An error occurred!');
					return false;
				}

				if (!res.data) {
					$scope.showSimpleToastTag('An error occurred!');
					return;
				}

				const msg = (payload.action === 'remove') ? 'Entry deleted!' : 'Saved!';
				$scope.showSimpleToastTag(msg);

				$scope.closeDialog({
					action: action,
					data: res.data
				});

			}, error => {
				console.log(error);
			});

		};

		$scope.confirmDeleteTag = () => {

			// Action
			$mdBottomSheet.cancel();

			$scope.payload = {
				id: $scope.tag._id,
				action: 'remove'
			};

			submitData($scope.payload);

		};

		$scope.cancelDialog = () => {
			// Action
			$mdBottomSheet.cancel();
		};

		//---------- Close

		$scope.closeDialog = data => {
			$scope.mdPanelRef.close();
			$rootScope.$broadcast('CloseTagInfoEditPanel', data);
		};

		//---------- Resize

		$scope.eventResize = () => {
			$scope.updatePosition();
		};

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