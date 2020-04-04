import angular from 'angular';

import Papa from 'papaparse';
import {app} from '../../AppConfig';


const init = () => {
	app.controller('ImportCtrl', ($scope, $rootScope, $http, $mdToast) => {

		// html
		$scope.fileExtensionOptions  = ['json','csv'];
		$scope.fileExtension = $scope.fileExtensionOptions[0];

		$scope.csvDataStructureOptions = ['node','edge'];
		$scope.csvDataStructure = $scope.csvDataStructureOptions[0];

		$scope.changeCSVDataStructure = value => $scope.csvDataStructure = value;

		let file;
		$scope.fileName;
		$scope.importResults;
		
		//file
		$scope.selectFile = () => {

			const fileInput = document.getElementById('file-input');

			fileInput.click();

			fileInput.onchange = e => {
				file = e.target.files[0];
				$scope.fileName = file.name;
				fileInput.value = '';

				$scope.$digest();
				importData();
			};
		};

		const importData = () => {

			$scope.importResults = null;

			if (!file) return;

			if (file.type === 'text/csv') {

				Papa.parse(file, {
					header: true,
					dynamicTyping: true,
					complete:  res => {
						if (res.data.length > 0) {
							submitData({
								data: res.data,
								dataType: file.type,
								csvData: $scope.csvDataStructure
							});
						} else {
							$scope.importResults = {error: true};
							$scope.showSimpleToastTag('An error occurred!');
							$scope.$digest();
						}
					},
					error: res => {
						$scope.showSimpleToastTag('An error occurred!');
						$scope.$digest();
					}
				});

			} else if (file.type === 'application/json') {

				const reader = new FileReader();
				reader.readAsText(file, 'UTF-8');

				reader.onload = res => {
					const content = res.target.result; // this is the content!
					const data = JSON.parse(content);
					submitData({
						data,
						dataType: file.type
					});
				};

				reader.onerror = res => {
					console.log(res);
					$scope.showSimpleToastTag('An error occurred!');
				};

				reader.onprogress = res => {
					// console.log(res);
				};

			}

		};

		const submitData = payload => {

			const req = {
				method: 'POST',
				url: 'api/node/create_many.php',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				data: payload
			};

			$http(req).then( res => {

				file = null;
				
				if (!res.data) return;
				
				$scope.importResults = res.data;
				$rootScope.$broadcast('importData');
				$scope.showSimpleToastTag('Import succeded.');

			}, res => {
				console.log(res);
				$scope.showSimpleToastTag('An error occurred!');
				file = null;
			});

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

	});
};

export default {
	init
};