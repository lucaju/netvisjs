import {app} from '../../AppConfig';

const init = () => {
	app.controller('TagInfoCtrl', function (
		$rootScope,
		$scope,
		$window,
		$mdPanel,
		mdPanelRef) {

		$scope.mdPanelRef = mdPanelRef;

		$scope.userLevel = this.user.level;
		$scope.tag = this.node;
		$scope.relations = this.node.relations;

		$scope.tagLinkColoredChip = false;

		$scope.departments = [];
		$scope.researchers = [];
		$scope.interests = [];

		//correct info
		$scope.showCorrectInfo = true;
		$scope.correctInfo = this.correctInfoButton;

		//check user
		// level: 0 - Super
		//        1 - Editor
		//        2 - User
		$scope.checkUserLevel = value => ($scope.userLevel <= value) ? true : false;

		//separete relations
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

		$scope.startEditingTag = tag => {
			$rootScope.$broadcast('tagEdition', tag);
			$scope.closeDialog();
		};

		$scope.closeDialog = () => {
			$scope.mdPanelRef.close();
			$rootScope.$broadcast('CloseTagInfoPanel');
		};

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