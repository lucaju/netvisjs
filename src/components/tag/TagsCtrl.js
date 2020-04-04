import angular from 'angular';

import {app} from '../../AppConfig';

import TagInfoCtrl from './TagInfoCtrl';
import TagInfoEditCtrl from './TagInfoEditCtrl';

const init = () => {

	TagInfoCtrl.init();
	TagInfoEditCtrl.init();

	app.controller('TagsCtrl', ($rootScope, $scope, $http, $mdPanel, $window, $mdColors) => {

		$scope.itemTagOver = '';
		$scope.tagEditing = false;

		$scope.searchBoxVisibility = false;
		$scope.searchQuery = {
			name: '',
			selected: undefined
		};
		$scope.filtered = false;

		$scope.correctInfoButton = {
			email: $rootScope.project.email,
			subject: $rootScope.project.title
		};

		$scope.tagListHeightOffset = 42 + 1 + 48 + 135; // top bar + adjust + bottom menu + sub headings categories

		$scope.tagListHeight = () => {
			return {
				height: ($window.innerHeight - $scope.tagListHeightOffset) + 'px'
			};
		};

		$scope.showTagSearchBox = value => {

			$scope.searchBoxVisibility = value;
			$scope.searchQuery.name = '';

			//update virtual repeater container style:height
			const searchBoxHeight = 58;

			if ($scope.searchBoxVisibility) {
				$scope.tagListHeightOffset += searchBoxHeight;
			} else {
				$scope.tagListHeightOffset -= searchBoxHeight;
			}

			if (!$scope.$root.$$phase) $scope.$digest();

		};

		$scope.filterTagByType = value => {

			$scope.filtered = value;

			if ($scope.filtered) {
				$scope.searchQuery.selected = true;
			} else {
				$scope.searchQuery.selected = undefined;
			}

		};

		$scope.tagChecked = ({selected, weight}) => (selected || weight > 0) ? true : false;

		$scope.highlightTags = ({selected}) => {
			let color;

			if (selected) {
				color = $mdColors.getThemeColor('appTheme-warn');
			} else {
				color = $mdColors.getThemeColor('appTheme-primary');
			}

			return {
				color
			};
		};

		$scope.showTagEditButton = (tagID, value) => {
			$scope.itemTagOver = (value ? tagID : undefined);
		};

		const selectTag = tag => {
			tag.selected = true;
			// $scope.netVis.nodes.push(tag);
			$rootScope.$broadcast('listTagSelected', tag);
		};

		const deselectTag = tag => {

			tag.selected = false;

			if ($scope.netVis.nodes.length === 0) {
				$scope.filterTagByType(false);
			}

			if (tag === tag.selected) tag.selected = false;

			const idx = $scope.netVis.nodes.indexOf(tag);
			if (idx > -1) {
				$scope.netVis.nodes.splice(idx, 1);
				if (!$scope.$root.$$phase) $scope.$digest();
				
			}
			if (!$scope.$root.$$phase) $scope.$digest();
		};

		$scope.tagPrimaryAction = tag => {

			const idx = $scope.netVis.nodes.indexOf(tag);
			if (idx > -1) {
				$rootScope.$broadcast('listTagDeselected', tag);
			} else {
				selectTag(tag);
			}

		};

		$scope.$on('visTagSelected', (event, tag) => {
			selectTag(tag);
			if (!$scope.$root.$$phase) $scope.$digest();
		});

		$scope.$on('visTagDeselected', (event, tag) => {
			deselectTag(tag);
		});
		
		$scope.clearTagSelection = () => {
			$scope.netVis.nodes = [];

			// angular.forEach($scope.dataNodes, tag => {
			for (const tag of $scope.dataNodes) {
				tag.selected = false;
				tag.weight = 0;
			}

			if ($scope.searchQuery.selected === true) $scope.filterTagByType(false);

			//broadcast to clear visualization
			$rootScope.$broadcast('clearTagSelection');
		};

		$scope.startEditingTag = tag => {
			$scope.tagBeenEdited = tag;
			$scope.tagEditing = true;
			$scope.tagDatabase = $scope.loadTagsDatabase();
			$scope.tagRelations = $scope.loadTagRelations($scope.tagBeenEdited.id);
		};

		$scope.addTag = () => {
			$scope.tagBeenEdited = {};
			$scope.tagEditing = true;
			$scope.tagDatabase = $scope.loadTagsDatabase();
			$scope.tagRelations = [];
		};

		$scope.$on('tagEdition', (event, tag) => $scope.showEditTagPanel({tag}));

		$scope.$on('visTagInfoPanel', (event,tag) => $scope.showTagInfoPanel(tag));

		// ***********************

		$scope.showTagInfoPanel = ({id}) => {

			//do nothing if it is the same panel;
			if ($scope.infoPanel && $scope.infoPanel.id === id) return;

			loadInfoTag(id);

		};

		const loadInfoTag = id => {

			$http.get(`api/node/read_one.php?id=${id}`).then( res => {

				if (res.status !== 200) return false;

				const node = res.data;
				showTagInfoPanelWithData(node);

			}, res => {
				console.log(res);
			});
		};

		const showTagInfoPanelWithData = node => {
			//positions
			const position = $mdPanel.newPanelPosition()
				.relativeTo(document.querySelector('#stage'))
				.addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.ALIGN_BOTTOMS);

			//animation
			const animation = $mdPanel.newPanelAnimation()
				.withAnimation({
					open: 'dialog-custom-animation-open',
					close: 'dialog-custom-animation-close'
				});

			//configurations
			const config = {
				id: node.id,
				animation: animation,
				attachTo: document.querySelector('#viz-port'),
				controller: 'TagInfoCtrl',
				templateUrl: 'components/tag/tag.info.html',
				locals: {
					node,
					user: {
						level: $scope.user.level
					},
					dataTag: $scope.dataNodes,
					correctInfoButton: $scope.correctInfoButton
				},
				panelClass: 'tag-info',
				position: position,
				trapFocus: false,
				zIndex: 80,
				hasBackdrop: false
			};

			const launchTagPanel = () => {
				//Create and launch
				$scope.infoPanel = $mdPanel.create(config);
				$scope.infoPanel.open().then( () => {
					const wrapper = angular.element(document.querySelector('.md-panel-outer-wrapper'));
					wrapper.addClass('md-panel-outer-wrapper-custom');
				});

			};

			//close opened panes
			if ($scope.infoPanel) {
				$scope.infoPanel.close().then( () => {
					$scope.infoPanel = null;
					launchTagPanel();
				});
			} else {
				launchTagPanel();
			}
		};

		$scope.$on('CloseTagInfoPanel', () => $scope.infoPanel = null);

		// ***********************

		$scope.showEditTagPanel = ({action, tag}) => {

			//action
			if (tag) {
				action = 'update';
			} else {
				tag = {id: -1};
			}

			//variables
			const locals = {
				action,
				tag,
				user: {
					level: $scope.user.level
				},
				dataTag: $scope.dataNodes,
				dataBaseReference: $scope.dataNodes
			};
			
			//positions
			const position = $mdPanel.newPanelPosition()
				.relativeTo(document.querySelector('#stage'))
				.addPanelPosition($mdPanel.xPosition.CENTER, $mdPanel.yPosition.ALIGN_BOTTOMS);

			//animation
			const animation = $mdPanel.newPanelAnimation()
				.withAnimation({
					open: 'dialog-custom-animation-open',
					close: 'dialog-custom-animation-close'
				});

			// //configurations
			const config = {
				id: `edit-${tag.id})`,
				animation: animation,
				attachTo: document.querySelector('#viz-port'),
				controller: 'TagInfoEditCtrl',
				templateUrl: 'components/tag/tag.info.edit.html',
				locals: locals,
				panelClass: 'tag-info',
				position: position,
				trapFocus: false,
				zIndex: 80,
				hasBackdrop: true
			};

			const launchTagPanel = () => {
				// //create and launch
				$scope.infoPanel = $mdPanel.create(config);
				$scope.infoPanel.open();
			};

			//close opened panes
			if ($scope.infoPanel) {
				$scope.infoPanel.close().then( () => {
					$scope.infoPanel = null;
					launchTagPanel();
				});
			} else {
				launchTagPanel();
			}

			// $scope.infoPanel = $mdPanel.create(config);
			// $scope.infoPanel.open()

		};

		// ***********************

		$scope.$on('CloseTagInfoEditPanel', (event, data) => {

			$scope.infoPanel = null;

			if (data !== undefined) {

				//update views
				if (data.action === 'created') {
					addTagToList(data);
				} else if (data.action === 'updated') {
					updateTagOnList(data);
				} else if (data.action === 'deleted') {
					deleteTagOnList(data);
				}
			}

		});

		const addTagToList = data => {

			//add data to collection
			data.weight = 0;
			data.selected = false;
			data.new = true;

			$scope.dataNodes.push(data);

			$scope.showTagInfoPanel(data);

		};

		const updateTagOnList = data => {

			const tag = getTagById(data.id);

			if (tag !== null) {
				if (data.type && data.type !== null && data.type !== '') tag.type = data.type;
				if (data.name && data.name !== null && data.name !== '') tag.name = data.name;
				if (data.first && data.first !== null && data.first !== '') tag.first = data.first;
				if (data.last && data.last !== null && data.last !== '') tag.last = data.last;
				if (data.website && data.website !== null && data.website !== '') tag.website = data.website;
				if (data.relationToAdd !== null) tag.linksAdded = data.relationToAdd;
				if (data.relationToDelete !== null) tag.linksRemoved = data.relationToDelete;

				//add label
				tag.new = true;

				//correct weight
				if (isNaN(tag.weight)) tag.weight = 0;

				$scope.showTagInfoPanel(tag);

				// $rootScope.$broadcast('listTagSelected', tag, 'update');
				$rootScope.$broadcast('updatedTagList', tag, 'update');
			}

		};

		const deleteTagOnList = ({id}) => {

			const tag = getTagById(id);
			const index = $scope.dataNodes.indexOf(tag);
			$rootScope.$broadcast('listTagDeselected', tag);
			$scope.dataNodes.splice(index, 1);

		};

		const getTagById = tagID => $scope.dataNodes.find( node => node.id === tagID);

	});
};

export default {
	init
};