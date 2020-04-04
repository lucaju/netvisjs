// import {select, selectAll, event} from 'd3-selection';
// import {nest, entries} from 'd3-collection';
// import {scaleOrdinal, scaleLinear} from 'd3-scale';
// import {range, max} from 'd3-array';
// import {rgb} from 'd3-color';
// import {schemeCategory10} from 'd3-scale-chromatic';
// import {forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY, forceCollide} from 'd3-force';
// import {timer} from 'd3-timer';
// import {drag} from 'd3-drag';

// import angular from 'angular';
import {jLouvain} from 'jlouvain';
import * as d3 from 'd3';

require('./network.css');

import {app} from '../../AppConfig';

const init = () => {

	app.controller('NetworkCtrl', ($rootScope, $scope, $mdColors, $http, $window) => {

		let nodesData = [];
		let linksData = [];

		let simulation;
		let node;
		let link;

		//size
		let networkContainerWidth;
		let networkContainerHeight;
		let svg;

		let graphInfo;

		const defaultSize = 1;
		const minRadius = 1;
		const maxRadius = 10;

		const defaultLinkWidth = 1;
		const minLinkWidth = 1;
		const maxLinkWidth = 25;

		let max_community_number = 4;

		$scope.clusterNest = [];

		let communityColors;

		//load data
		// $scope.$on('dataLoaded', event => {
		const startSimulation = () => {

			// console.log(d3.select('#side').node().getBoundingClientRect().width);
			// console.log(d3.select('#stage').node().getBoundingClientRect());
			// networkContainerWidth = window.innerWidth - d3.select('#side').node().getBoundingClientRect().width; // full window (-)side panel

			networkContainerWidth = d3.select('#stage').node().getBoundingClientRect().width; // full window (-)side panel
			networkContainerHeight = window.innerHeight - d3.select('#title').node().getBoundingClientRect().height - 5; // full height (-) title height

			// define svg
			svg = d3.select('#graph').append('svg')
				.attr('id', 'd3-net-vis')
				.attr('width', networkContainerWidth)
				.attr('height', networkContainerHeight);

			if ($scope.darkTheme) svg.style('background-color', '#000000');

			//prevent right click default
			svg.on('contextmenu', () => {
				d3.event.preventDefault();
			});

			graphInfo = d3.select('#graphInfo'); // TO IMPLEMENT

			// define force layout
			simulation = d3.forceSimulation()
				.force('link', d3.forceLink().id(d => d.id).distance($scope.netVisLayout.distance))
				.force('charge', d3.forceManyBody().strength($scope.netVisLayout.charge))
				.force('center', d3.forceCenter(networkContainerWidth / 2, networkContainerHeight / 2));
			// .force('x', d3.forceX(networkContainerWidth / 2).strength($scope.netVisLayout.gravity * 0.1))
			// .force('y', d3.forceY(networkContainerHeight / 2).strength($scope.netVisLayout.gravity * 0.1));

		};

		$scope.$on('updatedTagList', (event, tag, action) => {
			if (simulation && $scope.netVis.nodes.length > 0) updateSimulation(tag, action);
		});

		$scope.$on('listTagSelected', (event, tag, action) => {
			updateSimulation(tag, action);
		});

		const updateSimulation = (tag, action) => {

			if (!simulation) startSimulation();
			
			simulation.stop();

			//Add tag node if it is not already added.
			const _node = getNodeById(tag.id);
			if (!_node) {
			// if ($scope.netVis.nodes.indexOf(tag) === -1) {
				tag.weight = 0;
				$scope.netVis.nodes.push(tag);
			}

			if (_node && action === 'update' && tag.linksRemoved) {
				// angular.forEach(tag.linksRemoved, nodeRelation => {
				for (const nodeRelation of tag.linksRemoved) {
					changeNodeWeight(tag.id, nodeRelation, -1);
					_node.weight--;
				}
			}

			//load data
			// if (!_node || tag.linksAdded) {
			$http.get(`api/node/read_one.php?id=${tag.id}`).then( res => {

				if (res.status === 204) return [];

				if (res.data && res.data.relations) {

					//add metada - relation to node;
					tag.relations = res.data.relations;

					console.log(res);

					for (const relation of tag.relations) {
	
						let index;
						let endobj = relation;
	
						//add to relatoon 
						index = $scope.testInById(relation.id, $scope.netVis.researchers);
						if (index > -1) endobj = $scope.netVis.researchers[index];
	
						index = $scope.testInById(relation.id, $scope.netVis.nodes);
						if (index > -1) endobj = $scope.netVis.nodes[index];
	
						const nodeRelated = getNodeById(endobj.id);
						if (!nodeRelated) {
						// if ($scope.netVis.nodes.indexOf(endobj) === -1) {
							endobj.weight = 0;
							$scope.netVis.nodes.push(endobj);
							if (_node) _node.weight++;
						}
	
						///add link
						$scope.addLink(tag, endobj);
	
					}
				}
				
				$scope.updateForceLayout();

				
			}, res => {
				console.log(res);
				return false;
			});
			// } else {
			// 	$scope.updateForceLayout();
			// }

		};

		$scope.testInById = (id_needle, haystack) => {
			const ids = haystack.map(d => d.id);
			const index = ids.indexOf(id_needle);
			return index;
		};

		const getNodeById = tagID => $scope.netVis.nodes.find( node => node.id === tagID);

		$scope.addLink = (start, end) => {

			//Test if link already exists.
			let x;

			for (let i = 0; i < $scope.netVis.links.length; i++) {
				x = $scope.netVis.links[i];
				if (x.source.id === start.id && x.target.id === end.id) return x;
				if (x.source.id === end.id && x.target.id === start.id) return x;
			}

			//Else create new link.
			const newLink = {
				source: start,
				target: end,
				weight: 1
			};

			//add weight to the end pooints (source and target)
			start.weight++;
			end.weight++;

			//add the new link to the collection
			$scope.netVis.links.push(newLink);

			return newLink;
		};

		const simulationLayout = () => {

			//initial
			simulation = d3.forceSimulation()
				.nodes(nodesData)
				.force('center', d3.forceCenter(networkContainerWidth / 2, networkContainerHeight / 2))
				.force('x', d3.forceX(networkContainerWidth / 2).strength($scope.netVisLayout.gravity * 0.1))
				.force('y', d3.forceY(networkContainerHeight / 2).strength($scope.netVisLayout.gravity * 0.1))
				.on('tick', simulationTick); //!important

			//conditional: Network / Cluster
			if ($scope.netVisLayout.display === 'network') {

				simulation.force('link', d3.forceLink(linksData)
					.id(d => d.id)
					.distance($scope.netVisLayout.distance)
					.strength(link => {
						if ($scope.netVisLayout.linkStrenght === 'min') {
							return 1 / Math.min(link.source.weight, link.target.weight);
						} else if ($scope.netVisLayout.linkStrenght === 'max') {
							return 1 / Math.max(link.source.weight, link.target.weight);
						}
					}));

				simulation.force('charge', d3.forceManyBody().strength($scope.netVisLayout.charge));

				//collission
				if ($scope.netVisLayout.collision) {
					simulation.force('collide', d3.forceCollide(d => d.radius + 2).iterations(16));
				}

			} else if ($scope.netVisLayout.display === 'cluster') {

				simulation.force('collide', d3.forceCollide(d => d.radius + 2).iterations(16));

				//Conditional: Type / Community
				if ($scope.netVisLayout.cluster === 'type') {

					//set cluster: by type
					$scope.clusterNest = d3.nest()
						.key(d => d.type)
						.entries(nodesData);

					//map type to a number
					$scope.clusterNest.forEach(d => {
						switch (d.key) {
						case 'Interest':
							d.keyNum = 1;
							break;
						case 'Researcher':
							d.keyNum = 2;
							break;
						case 'Department':
							d.keyNum = 3;
							break;
						default:
							d.keyNum = 0;
							break;
						}
					});

				} else if ($scope.netVisLayout.cluster === 'community') {

					//set cluster: by community
					$scope.clusterNest = d3.nest()
						.key(d => d.community)
						.entries(nodesData);
				}

			}

		};

		function simulationTick() {

			//conditional: Netowrk / Cluster
			if ($scope.netVisLayout.display === 'network') {

				if ($scope.netVisLayout.showLinks) {
					svg.selectAll('.link')
						.attr('x1', d => d.source.x)
						.attr('y1', d => d.source.y)
						.attr('x2', d => d.target.x)
						.attr('y2', d => d.target.y);
				}

				if ($scope.netVisLayout.showNodes) {
					svg.selectAll('.circle')
						.attr('cx', d => d.x)
						.attr('cy', d => d.y);
				}

				//title position // dy - displace to show just below the node
				if ($scope.netVisLayout.showTitles) {

					// const title = node.selectAll('.nodeTitle')
					const title = svg.selectAll('.nodeTitle')
						.attr('x', d => d.x)
						.attr('y', d => d.y);

					if ($scope.netVisLayout.showNodes) {
						title.attr('dy', function () {
							const node = d3.select(this.parentNode);
							const r = node.select('.circle').attr('r');
							return Number(r) + 8;
						});
					}

				}



			} else if ($scope.netVisLayout.display === 'cluster') {

				//for multi foci -- group separation
				// Push different nodes in different directions for clustering.

				const c = ($scope.netVisLayout.cluster === 'type') ? 10 : 2;
				const k = $scope.clusterNest.length * c * this.alpha();

				nodesData.forEach( o => {

					for (let n = 0; n < $scope.clusterNest.length; n++) {

						//condtional: Type / Community
						if ($scope.netVisLayout.cluster === 'type') {

							if (o.type === $scope.clusterNest[n].key) {
								o.x += k * Math.cos(Number($scope.clusterNest[n].keyNum));
								o.y += k * Math.sin(Number($scope.clusterNest[n].keyNum));
								break;
							}

						} else if ($scope.netVisLayout.cluster === 'community') {

							if (o.community === $scope.clusterNest[n].key) {
								o.x += k * Math.cos(Number($scope.clusterNest[n].key));
								o.y += k * Math.sin(Number($scope.clusterNest[n].key));
								break;
							}
						}
					}

				});

				if ($scope.netVisLayout.showNodes) {
					svg.selectAll('.circle')
						.attr('cx', d => d.x)
						.attr('cy', d => d.y);
				}

				//title position // dy - displace to show just below the node
				if ($scope.netVisLayout.showTitles) {

					const title = svg.selectAll('.nodeTitle')
						.attr('x', d => d.x)
						.attr('y', d => d.y);

					if ($scope.netVisLayout.showNodes) {
						title.attr('dy', function () {
							const node = d3.select(this.parentNode);
							const r = node.select('.circle').attr('r');
							return Number(r) + 8;
						});
					}

				}

			}

		}

		const communityDetection = () => {

			// if (nodesData.length > 0 && $scope.netVisLayout.communityDetection) {
			if (nodesData.length > 0) {

				// const original_node_data = d3.entries($scope.netVis.nodes);

				const nodesIndex = [];
				nodesData.forEach(d => {
					nodesIndex.push(d.index);
				});

				const edgesData = [];
				linksData.forEach(d => {
					const edge = {
						source: d.source.index,
						target: d.target.index,
						weight: d.weight
					};
					edgesData.push(edge);
				});

				// const partition = {};
				// nodesData.forEach(d => {
				// 	partition[d.index] = d.attributes.modularityClass;
				// });

				const community = jLouvain().nodes(nodesIndex).edges(edgesData);

				const community_assignment_result = community();
				// const node_ids = Object.keys(community_assignment_result);

				max_community_number = 0;

				nodesData.forEach(d => {

					// if (community_assignment_result[d.index]) {
					d.community = community_assignment_result[d.index];
					max_community_number = max_community_number < community_assignment_result[d.index] ? community_assignment_result[d.index] : max_community_number;
					// }

				});

				// }

				// } else {

				// 	// nodesData.forEach(function(d) {
				// 	// 	d.community = d.attributes.modularityClass;
				// 	// });

			}

		};

		$scope.updateForceLayout = () => {

			/// save data
			nodesData = $scope.netVis.nodes;
			linksData = $scope.netVis.links;

			graphInfo.text('nodes: ' + nodesData.length + ' | ' + 'links:' + linksData.length);

			if (linksData.length > 0) communityDetection();

			//links first: lower layer
			displayLinks();
			displayNodes();

			//define simulation parameters based on the display option: Network / Cluster
			simulationLayout();

		};

		const displayLinks = () => {

			if ($scope.netVisLayout.showLinks) {

				// --- remove all !important

				nodesData = [];

				link = svg.selectAll('.link')
					.data(nodesData);

				link.exit().remove();

				linksData = $scope.netVis.links;

				//select
				link = svg.selectAll('.link')
					.data(linksData);

				//remove
				link.exit().remove();

				//add-update: draw line, add class, define stroke-linecap (end of the line)
				link.enter().append('line')
					.attr('class', 'link')
					.attr('stroke-linecap', 'round');

				//define color
				$scope.updateLinkColor();
				//define thickness
				$scope.updateLinkThickness();

			} else {

				//remove all
				const linkData = [];

				link = svg.selectAll('.link')
					.data(linkData);

				link.exit().remove();

			}

		};

		$scope.updateLinkColor = transition => {

			if ($scope.netVisLayout.showLinks) {
				//select
				const links = svg.selectAll('.link');

				//style for all
				links.style('stroke-opacity', 0.2);
				if ($scope.darkTheme) links.style('stroke-opacity', 0.2);

				//if transition
				if (transition) links.transition().duration(1000);

				//condition: Default / Community
				if ($scope.netVisLayout.linkColor === 'default') {

					//same color to all
					links.style('stroke', '#999');
					if ($scope.darkTheme) links.style('stroke', '#EEE');

				} else if ($scope.netVisLayout.linkColor === 'community') {

					if (!communityColors) communityColors = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range([0, max_community_number]));
					links.style('stroke', d => communityColors(d.source.community));

				}
			}

		};

		$scope.updateLinkThickness = transition => {

			if ($scope.netVisLayout.showLinks) {

				//select
				const links = svg.selectAll('.link');

				//if transition
				if (transition) links.transition().duration(1000);

				//condition: defaul / community
				if ($scope.netVisLayout.linkThickness === 'default') {

					//same width for all
					links.style('stroke-width', defaultLinkWidth);

				} else if ($scope.netVisLayout.linkThickness === 'weight') {

					// if there attribute wight is defined ------- 
					// const scale = d3.scaleLinear()
					// 	.domain([0, d3.max(linksData, d => { console.log(d); return d.weight; })])
					// 	.range([minLinkWidth, maxLinkWidth]);

					// link.style('stroke-width', d => scale(d.weight) )

					//scale based on pre-defined min and max values mapped to the min and max weight in the visualiation
					const scale = d3.scaleLinear()
						.domain([0, d3.max(linksData, d => d.source.weight + d.target.weight)])
						.range([minLinkWidth, maxLinkWidth]);

					links.style('stroke-width', d => scale(d.source.weight + d.target.weight));
				}
			}

		};

		const displayNodes = () => {

			// --- remove all !important

			nodesData = [];

			let node = svg.selectAll('.node')
				.data(nodesData);

			node.exit().remove();

			//put all
			nodesData = $scope.netVis.nodes;
			// simulation.nodes(nodesData)

			node = svg.selectAll('.node')
				.data(nodesData);

			node.enter().append('g')
				.attr('class', 'node');

			//CIRCLES
			//The condition comes later in the process so the nodes can show
			//titles even when user select to not show the nodes (circles)
			if ($scope.netVisLayout.showNodes) {

				//select
				node = svg.selectAll('.node');

				//Add circles
				const circle = node.append('circle')
					.attr('class', 'circle')
					.on('mouseover', function () {
						const nodeDatum = d3.select(this).datum();
						highlightEgo(nodeDatum.index);
					})
					.on('mouseout', () => {
						highlightEgo(-1);
					});

				//CLICKS
				const timer = d3.timer(elapsed => {
					if (elapsed > 50) timer.stop();
				});

				timer.stop();

				//CLICK: Get info
				circle.on('click', d => {
					timer.restart(elapsed => {
						if (elapsed > 250) {
							timer.stop();
							$scope.netVis.select = d;
							$rootScope.$broadcast('visTagInfoPanel', d);
							// $scope.showTagInfoPanel(d, 'view');
						}
					}, 250);
				});

				//DOUBLE-CLICK: expand relations
				circle.on('dblclick', d => {
					timer.stop();
					$rootScope.$broadcast('visTagSelected', d);
				});

				//RIGHT CLICK: 
				circle.on('contextmenu', d => {
					$scope.deselect(d);
				});

				//----drag
				const dragstarted = d => {
					if (!d3.event.active) simulation.alphaTarget(0.3).restart();
					d.fx = d.x;
					d.fy = d.y;
				};

				const dragged = d => {
					d.fx = d3.event.x;
					d.fy = d3.event.y;
				};

				const dragended = d => {
					if (!d3.event.active) simulation.alphaTarget(0);
					d.fx = null;
					d.fy = null;
				};

				circle.call(d3.drag()
					.on('start', dragstarted)
					.on('drag', dragged)
					.on('end', dragended));

				updateNodeSize();
				$scope.updateNodeColor();

			}

			//TITLES
			if ($scope.netVisLayout.showTitles) {

				//select
				node = svg.selectAll('.node');

				//add text
				node.append('text')
					.attr('class', 'nodeTitle')
					.attr('text-anchor', 'middle')
					.text(d => d.name);

				//confugure
				$scope.updateNodeTitleSize();
				$scope.updateNodeTitleColor();
			}

			//remove garbage 
			node.exit().remove();

			//add mouse over accecibility
			node.append('title')
				.text(d => d.name);

		};

		const updateNodeSize = transition => {

			//select
			let nodes = svg.selectAll('.circle');

			//transition
			if (transition) nodes = nodes.transition().duration(1000);

			//Condition: Default/Weight
			if ($scope.netVisLayout.nodeSize === 'default') {

				//Same size to all
				nodes.attr('r', d => {
					d.radius = defaultSize * $scope.netVisLayout.nodeScale;
					return d.radius;
				});


			} else if ($scope.netVisLayout.nodeSize === 'weight') {

				//Scale weight based on the min and max in the current
				//visualization mapped to min and max predefined sizes
				const scale = d3.scaleLinear()
					.domain([0, d3.max(nodesData, d => d.weight)])
					.range([minRadius, maxRadius]);

				nodes.attr('r', d => {
					d.radius = scale(d.weight * $scope.netVisLayout.nodeScale);
					return scale(d.weight * $scope.netVisLayout.nodeScale);
				});
			}

			//may affect titles
			if ($scope.netVisLayout.showTitles && $scope.netVisLayout.titleScale) {
				$scope.updateNodeTitleSize(true);
			}

		};

		$scope.updateNodeColor = transition => {

			//select
			let nodes = svg.selectAll('.node');

			//transition
			if (transition) nodes = nodes.transition().duration(1000);


			//conditions: Default / Type / Community (Calculated)
			if ($scope.netVisLayout.nodeColor === 'default') {

				//same color and stroke color to all
				nodes.style('fill', d3.rgb('#333').darker(0.4));
				nodes.style('stroke', d3.rgb('#333').darker(0.4));

				if ($scope.darkTheme) nodes.style('fill', d3.rgb('#EEE'));
				if ($scope.darkTheme) nodes.style('stroke', d3.rgb('#EEE'));

			} else if ($scope.netVisLayout.nodeColor === 'community') {

				communityColors = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range([0, max_community_number]));
				nodes.style('fill', d => communityColors(d.community));
				nodes.style('stroke', d => d3.rgb(communityColors(d.community)).darker(0.4));
				//$scope.updateLinkColor(true);


			} else if ($scope.netVisLayout.nodeColor === 'type') {

				//Color according node type
				nodes.style('fill', d => {
					if (d.type === 'Department') {
						return $mdColors.getThemeColor('appTheme-warn-hue-1');
					} else if (d.type === 'Interest') {
						if ($scope.darkTheme) d3.rgb('#EEE');
						return $mdColors.getThemeColor('appTheme-primary-hue-2');
					} else if (d.type === 'Researcher') {
						return $mdColors.getThemeColor('appTheme-accent-hue-1');
					}

				});

				nodes.style('stroke', d => {
					if (d.type === 'Department') {
						return $mdColors.getThemeColor('appTheme-warn-hue-1');
					} else if (d.type === 'Interest') {
						if ($scope.darkTheme) d3.rgb('#EEE');
						return $mdColors.getThemeColor('appTheme-primary-hue-2');
					} else if (d.type === 'Researcher') {
						return $mdColors.getThemeColor('appTheme-accent-hue-1');
					}

				});


			}

		};

		$scope.updateNodeTitleSize = transition => {

			if ($scope.netVisLayout.showTitles) {

				//select
				let nodes = svg.selectAll('.node');

				//transition
				if (transition) nodes = nodes.transition().duration(1000);

				//condition: False / True
				if (!$scope.netVisLayout.titleScale) {

					//default size
					nodes.attr('font-size', '0.5em');

				} else {

					//scale size using node radius
					const scale = d3.scaleLinear()
						.domain([0.5, d3.max(nodesData, d => d.radius)])
						.range([minRadius, maxRadius]);

					nodes.attr('font-size', d => (scale(d.radius) * $scope.netVisLayout.nodeScale) * 0.02 + 'em');
				}

			}

		};

		$scope.updateNodeTitleColor = transition => {

			if ($scope.netVisLayout.showTitles) {

				//selection
				// let titles = node.selectAll('.nodeTitle');
				let titles = d3.selectAll('.nodeTitle');

				//transition
				if (transition) titles = titles.transition().duration(1000);

				titles.style('stroke', 'none');
				titles.style('stroke-width', '0px');

				//Condition: False / true
				if (!$scope.netVisLayout.titleInheritColor) {
					//same color to all
					titles.style('fill', '#333');
					if ($scope.darkTheme) titles.style('fill', '#EEE');

				} else if ($scope.netVisLayout.titleInheritColor) {
					//inherit color from node
					titles.style('fill', 'inherit');

				}

			}

		};

		const highlightEgo = nodeIndex => {

			//coonditional Out / Over
			if (nodeIndex === -1) {

				//back to normal
				svg.selectAll('.node')
					.style('opacity', 1);

				svg.selectAll('.link')
					.style('stroke-opacity', 0.2);

			} else {

				const adjacentNodes = [];

				//Links
				svg.selectAll('.link')
					.style('stroke-opacity', d => {
						//change opacity
						if (d.source.index === nodeIndex || d.target.index === nodeIndex) {
							return 0.6;
						} else {
							return 0.05;
						}
					})
					.each(d => {
						//save adjacent nodes
						if (d.source.index === nodeIndex || d.target.index === nodeIndex) {
							adjacentNodes.push(d.target.index);
						}

					});

				//nodes
				svg.selectAll('.node')
					.style('opacity', d => {
						if (d.index === nodeIndex) {
							return 1;

						} else {

							let nodeOpacity = 0.1;

							for (let a = 0; a < adjacentNodes.length; a++) {
								if (d.index === adjacentNodes[a]) {
									nodeOpacity = 0.6;
									break;
								}
							}

							return nodeOpacity;

						}
					});

			}

		};

		const gooeyFX = () => {

			//Condition True / False
			if ($scope.netVisLayout.gooeyFX) {

				//Add FX

				//svg.style('filter', 'url('#gooey')') //Set the filter on the container svg
				svg.style('filter', 'url(#gooey)'); //Set the filter on the container svg

				const defs = svg.append('defs');
				const filter = defs.append('filter').attr('id', 'gooey');

				filter.append('feGaussianBlur')
					.attr('in', 'SourceGraphic')
					.attr('stdDeviation', '3')
					.attr('color-interpolation-filters', 'sRGB')
					.attr('result', 'blur');
				filter.append('feColorMatrix')
					.attr('in', 'blur')
					.attr('mode', 'matrix')
					.attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7')
					.attr('result', 'gooey');

				// --- Duplicate origina image on top to make a crisp image
				// filter.append('feBlend')
				// 	.attr('in','SourceGraphic')
				// 	.attr('in2','gooey')



			} else {
				//remove FX
				svg.select('defs').remove();
				svg.style('filter', null);

			}
		};

		//Listener: Layout Change
		$scope.$on('networkLayoutChange', (event, source) => {

			if(!simulation) startSimulation();

			simulation.stop();

			switch (source) {

			case 'display':

				if ($scope.netVisLayout.display === 'network') {
					$scope.netVisLayout.showLinks = true;

				} else if ($scope.netVisLayout.display === 'cluster') {
					$scope.netVisLayout.collision = true;
					$scope.netVisLayout.showLinks = false;

				}

				$scope.updateForceLayout();
				break;

			case 'cluster':
				$scope.updateForceLayout();
				break;

			case 'gravity':
				simulation.force('x', d3.forceX(networkContainerWidth / 2).strength($scope.netVisLayout.gravity * 0.1))
					.force('y', d3.forceY(networkContainerHeight / 2).strength($scope.netVisLayout.gravity * 0.1))
					.alpha(1)
					.restart();
				break;

			case 'charge':
				simulation.force('charge', d3.forceManyBody()
					.strength($scope.netVisLayout.charge))
					.alpha(1)
					.restart();
				break;

			case 'distance':
				simulation.force('link', d3.forceLink(linksData)
					.id(d => d.id)
					.distance($scope.netVisLayout.distance))
					.alpha(1)
					.restart();
				break;

			case 'colission':
				$scope.updateForceLayout();
				break;

			case 'showNode':
				$scope.updateForceLayout();
				break;

			case 'nodeScale':
				updateNodeSize(true);
				$scope.updateForceLayout();
				break;

			case 'nodeSize':
				updateNodeSize(true);
				$scope.updateForceLayout();
				break;

			case 'nodeColor':
				$scope.updateNodeColor(true);
				simulation.alpha(0.3).restart();
				break;

			case 'showTitles':
				$scope.updateForceLayout();
				break;

			case 'titleScale':
				$scope.updateNodeTitleSize(true);
				simulation.alpha(0.3)
					.restart();
				break;

			case 'titleInheritColor':
				$scope.updateNodeTitleColor(true);
				simulation.alpha(0.3)
					.restart();
				break;

			case 'showLinks':
				$scope.updateForceLayout();
				break;

			case 'linkThickness':
				$scope.updateLinkThickness();
				simulation.alpha(0.3)
					.restart();
				break;

			case 'linkColor':
				$scope.updateLinkColor(true);
				simulation.alpha(0.3)
					.restart();
				break;

			case 'linkStrenght':
				simulation.force('link', d3.forceLink(linksData)
					.id(d => d.id)
					.distance($scope.netVisLayout.distance)
					.strength(link => {
						if ($scope.netVisLayout.linkStrenght === 'max') {
							return 1 / Math.max(link.source.weight, link.target.weight);
						} else {
							return 1 / Math.min(link.source.weight, link.target.weight);
						}
					}))
					.alpha(1)
					.restart();

				break;

			case 'gooeyFX':
				gooeyFX();
				simulation.alpha(0.3)
					.restart();
				break;

			case 'changeColorTheme':
				$scope.darkTheme = !$scope.darkTheme;
				if ($scope.darkTheme) {
					svg.style('background-color', '#000000');
				} else {
					svg.style('background-color', 'transparent');
				}
				$scope.updateNodeColor(true);
				$scope.updateLinkColor(true);
				$scope.updateNodeTitleColor(true);
				simulation.alpha(0.1)
					.restart();
				break;

			case 'sideBar':
				$scope.eventResize();
				// simulation.alpha(0.3).restart();
				break;

			default:
				break;
			}

		});


		/***** UPDATE FUNCTIONS *****/
		const changeNodeWeight = (sourceTagID, targetTagID, value) => {

			const sourceTag = getNodeById(sourceTagID);
			const targetTag = getNodeById(targetTagID);

			//reduce weight
			// console.log(targetTag)
			if (sourceTag && targetTag) {
				
				targetTag.weight += value;

				//remove link
				// angular.forEach($scope.netVis.links, link => {
				for (const link of $scope.netVis.links) {
					// let check = false;
					if (link.source === sourceTag && link.target === targetTag ||
						link.source === targetTag && link.target === sourceTag) {
						const linkIndex = $scope.netVis.links.indexOf(link);
						$scope.netVis.links.splice(linkIndex, 1);
					}
				}

				//test remove orphaned nodes
				if (sourceTag.weight <= 0) $scope.eventRemove(sourceTag, 'cluster');
				if (targetTag.weight <= 0) $scope.eventRemove(targetTag, 'cluster');
			}
		};

		/***** REMOVE FUNCTIONS *****/
		/** 
		 *  Listen the side bar for deselections
		 *
		 */
		$scope.$on('listTagDeselected', (event, tag) => {
			$scope.eventRemove(tag);
			$rootScope.$broadcast('visTagDeselected', tag, 'menu');
		});

		/** 
		 *  Deselection from the visualzation
		 *  Dispatch event to deselect in the side bar
		 */
		$scope.deselect = tag => {
			$scope.eventRemove(tag);
			$rootScope.$broadcast('visTagDeselected', tag, 'vis');
		};

		/** 
		 *  Remove node and its connection from visualization
		 *  
		 */
		$scope.eventRemove = (tag, source) => {

			// const nodesToRemove = [];

			if (tag === $scope.netVis.select) {
				$scope.netVis.select = false;
			}

			// Remove edges from clicked node.
			$scope.netVis.links = $scope.netVis.links.filter(link => {
				if (link.source !== tag && link.target !== tag) {
					return true;
				} else {
					//reduce weight of the remaining nodes (which can produce orphaned Nodes)
					// angular.forEach($scope.netVis.nodes, node => {
					for (const node of $scope.netVis.nodes) {
						if (node === link.source || node === link.target) node.weight--;
					}

				}
			});

			// // Remove orphaned Nodes.
			removeOrphanedNodes();

			if (source !== 'cluster') $scope.updateForceLayout();
		};

		function removeOrphanedNodes() {
			$scope.netVis.nodes = $scope.netVis.nodes.filter(node => {
				if (node.weight > 0) return true;
			});
		}

		/*
		* Clear visualization
		*
		*/
		$scope.$on('clearTagSelection', event => {

			$scope.netVis.select = false;
			$scope.netVis.links.splice(0, $scope.netVis.links.length);
			$scope.netVis.nodes.splice(0, $scope.netVis.nodes.length);

			$scope.updateForceLayout();
		});

		$scope.$on('exportGraph', event => {
			if (simulation) simulation.stop();
		});

		$scope.$on('importData', event => {
			if (simulation) {
				$scope.netVis.select = false;
				$scope.updateForceLayout();
				if(simulation) simulation.stop();
			}
		});



		//*********** RESIZE   
		$scope.eventResize = () => {

			if ($scope.sideBarOpen) {
				// networkContainerWidth = window.innerWidth - d3.select('#side').node().getBoundingClientRect().width; // full window (-)
				networkContainerWidth = window.innerWidth - 300; // hack 
			} else {
				networkContainerWidth = window.innerWidth;
			}

			networkContainerHeight = window.innerHeight - d3.select('#title').node().getBoundingClientRect().height - 5; // full height (-) title height

			if (svg) svg.attr('width', networkContainerWidth).attr('height', networkContainerHeight);

			if (simulation) {
				simulation.force('center', d3.forceCenter(networkContainerWidth / 2, networkContainerHeight / 2))
					.force('x', d3.forceX(networkContainerWidth / 2).strength($scope.netVisLayout.gravity * 0.1))
					.force('y', d3.forceY(networkContainerHeight / 2).strength($scope.netVisLayout.gravity * 0.1))
					.alpha(0.3)
					.restart();
			}
		};

		//*********** initials 
		$window.addEventListener('resize', $scope.eventResize);
		$scope.eventResize();

	});
};

export default {
	init
};