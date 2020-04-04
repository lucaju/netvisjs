
import {saveAs} from 'file-saver';
import JSZip from 'jszip';
import Papa from 'papaparse';
import {svgAsPngUri} from 'save-svg-as-png';

import {app} from '../../AppConfig';


const init = () => {

	app.controller('ExportCtrl', (
		$scope,
		$rootScope) => {

		$scope.dataFileSelectionOptions = ['selected', 'all'];
		$scope.dataFileSelection = 'selected';

		$scope.dataFileTypeOptions = ['csv', 'json'];
		$scope.dataFileType = 'csv';

		$scope.graphFileTypeOptions = ['svg', 'png'];
		$scope.graphFileType = 'png';

		$scope.zipFiles = false;


		$scope.disabled = () => ($scope.netVis.nodes.length > 0) ? false : true;

		$scope.exportData = () => {
			if ($scope.netVis.nodes.length > 0 && $scope.checkUserLevel(1)) {
				if ($scope.dataFileType === 'csv') {
					exportCSV();
				} else if ($scope.dataFileType === 'json') {
					exportJson();
				}
			}
		};

		const exportCSV = () => {

			//collections
			const nodesToExport = [];
			const linksToExport = [];

			//list nodes
			for (const n of $scope.netVis.nodes) {
				nodesToExport.push({
					id: n.id,
					name: n.name,
					type: n.type
				});

				//list edges
				if (n.relations) {
					for (const e of n.relations) {
						linksToExport.push({
							source: n.name,
							target: e.name,
							sourceType: n.type,
							targetType: e.type
						});
					}
				}

			}

			//parser
			const nodesCSV = Papa.unparse(nodesToExport);
			const linksCSV = Papa.unparse(linksToExport);

			const data = [
				{
					data: nodesCSV,
					name: 'nodes',
					dataType: 'csv'
				},
				{
					data: linksCSV,
					name: 'links',
					dataType: 'csv'
				}
			];

			deliverDataset(data);

		};

		const exportJson = () => {
			
			//collection
			const networkToExport = [];

			for (const n of $scope.netVis.nodes) {
				networkToExport.push({
					id: n.id,
					name: n.name,
					type: n.type,
					edges: n.relations
				});
			}

			//parser
			const nodesJson = JSON.stringify(networkToExport, null, ' ');

			const data = [
				{
					data: nodesJson,
					name: 'nodes',
					dataType: 'json'
				}
			];

			deliverDataset(data);

		};

		const deliverDataset = exportCollection => {
			
			//if zip
			if ($scope.zipFiles) {

				const zip = new JSZip();

				for (const file of exportCollection) {
					zip.file(file.name, file.data);
				}

				zip.generateAsync({
					type: 'blob'
				}).then(blob => {
					saveAs(blob, 'network.zip');
				});

			} else {

				//separated files
				for (const {name, dataType, data} of exportCollection) {
					const fileBlob = new Blob([data], {
						type: `text/${dataType}`
					});

					saveAs(fileBlob, `${name}.${dataType}`);
				}

			}
		};

		//************* */

		$scope.exportGraph = () => {
			if ($scope.netVis.nodes.length > 0) {
				if ($scope.graphFileType === 'svg') {
					exportSVG();
				} else if ($scope.graphFileType === 'png') {
					exportPNG();
				}
			}
		};

		const exportPNG = () => {
			
			//remove gooey
			if ($scope.netVisLayout.gooeyFX) {
				$scope.netVisLayout.gooeyFX = false;
				$scope.triggerLayoutUpdate('gooeyFX');
			}

			//get graph
			$rootScope.$broadcast('exportGraph', $scope.graphFileType);

			const graph = document.getElementById('d3-net-vis');

			//This library cut the SVG graph using the view port. 
			//To avoid this cut, a new set of boundaries is need to be pass to the library.

			const margin = 50;

			let graphLeft = 0;
			let graphTop = 0;
			let graphRight = document.getElementById('graph').offsetWidth;
			let graphBottom = document.getElementById('graph').offsetHeight;

			for (const node of $scope.netVis.nodes) {
				//test each boundary
				if (node.x < graphLeft) graphLeft = node.x;
				if (node.y < graphTop) graphTop = node.y;
				if (node.x > graphRight) graphRight = node.x;
				if (node.y > graphBottom) graphBottom = node.y;

			}

			graphLeft = graphLeft - margin;
			graphTop = graphTop - margin;
			const graphWidth = (graphLeft * Math.sign(graphLeft)) + graphRight + margin;
			const graphHeight = (graphTop * Math.sign(graphTop)) + graphBottom + margin;

			const pngConfig = {
				left: graphLeft,
				top: graphTop,
				width: graphWidth,
				height: graphHeight,
				scale: 2
			};

			//function to trabsform the PNG Uri to a BLOB
			//https://gist.github.com/davoclavo/4424731
			const dataURItoBlob = dataURI => {
				// convert base64 to raw binary data held in a string
				const byteString = atob(dataURI.split(',')[1]);

				// separate out the mime component
				const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

				// write the bytes of the string to an ArrayBuffer
				const arrayBuffer = new ArrayBuffer(byteString.length);
				const _ia = new Uint8Array(arrayBuffer);
				for (let i = 0; i < byteString.length; i++) {
					_ia[i] = byteString.charCodeAt(i);
				}

				const dataView = new DataView(arrayBuffer);
				const blob = new Blob([dataView], {
					type: mimeString
				});
				return blob;
			};

			const dowloadFile = blob => {
				if ($scope.zipFiles) {

					const zip = new JSZip();
					zip.file('network.png', blob);
					zip.generateAsync({
						type: 'blob'
					}).then(blob => {
						saveAs(blob, 'network.zip');
					});

				} else {
					//png
					saveAs(blob, 'network.png');
				}
			};

			//save as PNG
			svgAsPngUri(graph, pngConfig, uri => {
				const blob = dataURItoBlob(uri);
				dowloadFile(blob);
			});

			//restore gooey
			if ($scope.netVisLayout.gooeyFX) {
				$scope.netVisLayout.gooeyFX = true;
				$scope.triggerLayoutUpdate('gooeyFX');
				$rootScope.$broadcast('exportGraph', $scope.graphFileType);
			}
		};

		const exportSVG = () => {

			//stop graph
			$rootScope.$broadcast('exportGraph', $scope.graphFileType);

			//get canvas
			const graph = document.getElementById('d3-net-vis');

			//serilize
			const svgXML = new XMLSerializer().serializeToString(graph);

			//deliver
			if ($scope.zipFiles) {

				const zip = new JSZip();
				zip.file('network.svg', svgXML);
				zip.generateAsync({
					type: 'blob'
				}).then(blob => {
					saveAs(blob, 'network.zip');
				});

			} else {

				//svg
				const blob = new Blob([svgXML], {
					type: 'image/svg+xml'
				});
				saveAs(blob, 'network.svg');
			}
		};

	});

};

export default {
	init
};