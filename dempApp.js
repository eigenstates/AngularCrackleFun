var demoApp = angular.module('demoApp', [/*dependancies*/])

var controllers = {}
controllers.DoggieController = function($scope){

	$scope.doggies = [
		{name:"Cindy Lou",type:"Chinese Crested"},
		{name:"Lucy Chew",type:"Chinese Crested"},
		{name:"Bandit",type:"Jack Russell"},
		{name:"Captain Frank",type:"Golden Retriever"},
		{name:"Spanky",type:"Border Collie"}
	]
}

demoApp.controller(controllers);
