var myApp = angular.module("myModule",[]);

myApp.controller('myControllerLogin', ['$scope', '$http', '$window', function($scope,$http,$window){
	
	var loginIcon = {
		name : "Login",
		loginPngLoc : "/Images/login.png",
		message : "Sign In"
	};
	$scope.loginIcon = loginIcon ;
			
	$scope.submitLoginData = function(){
	var data = {
		username: $scope.userName,
		password : $scope.password
	}
		
	$http(
		{
		   method: 'POST',
		   url: 'http://localhost:8080/loginData/', 
		   data: data  
		}).then(function successCallback(response) {
			if(JSON.stringify(response) != '{}' && response.data.status == "200"){
					window.location.replace("http://localhost:8080/requestTable.html");
			}else{
				alert(response.data.message);
			}				
		});
	}
	
}]);

myApp.controller('myControllerRequest', ['$scope', '$http', '$window', function($scope,$http,$window){
	
	$http(
		{
		   method: 'POST',
		   url: 'http://localhost:8080/requestTableData/', 
		}).then(function successCallback(response) {
			console.log(response);
						console.log(response.data.status);			
			if(JSON.stringify(response) != '{}' && response.data.status == "200"){
					$scope.requestTableData = response.data.message.rows;
			}else{
				alert(response.data.message);
			}				
		});
		

	$scope.getApplicantData = function(clickedData){
	
		var data = {
				id: clickedData.doc.digitalId,
		};
	$http(
		{
		   method: 'POST',
		   url: 'http://localhost:8080/applicantData/', 
		   data: data  
		}).then(function successCallback(response) {
			console.log(response);
			if(JSON.stringify(response) != '{}' && response.data.status == "200"){
				var applicantData = response.data.message;
				applicantData["requestId"] = clickedData.doc._id;
				console.log(applicantData);
				$window.sessionStorage.setItem("Mydata",JSON.stringify(applicantData));
				window.location.replace("http://localhost:8080/UniversityData.html");				
			}else{
				alert(response.data.message);
			}				
		});		
	}
}]);

myApp.controller('myControllerStudent', ['$scope', '$http', '$window', function($scope,$http,$window){
	$scope.success = false;
	$scope.failure = false;

	$scope.coursenames = ["Ancient History", "Computer Science", "Microservices"];
	
	var loginIcon = {
		name : "Login",
		loginPngLoc : "/Images/login.png",
		message : "Sign In"
	};
	$scope.loginIcon = loginIcon ;
	
	var successIcon = {
		name : "Verify",
		successPngLoc : "/Images/Success.png",
		message : "Success"
	};
	$scope.successIcon = successIcon ;
	
	var errorIcon = {
		name : "Not verified",
		errorPngLoc : "/Images/error.png",
		message : "Error"
	};
	$scope.errorIcon = errorIcon ;

	$scope.selectedApplicantData = JSON.parse($window.sessionStorage.getItem("Mydata"));
	console.log($scope.selectedApplicantData);
	$scope.attachment = Object.keys($scope.selectedApplicantData._attachments)[0];
	$scope.dateOfBirth = new Date($scope.selectedApplicantData.dob);

	$scope.verify = function(){
	
		var data = {
				id: $scope.selectedApplicantData.digitalId
		};
	$http(
		{
		   method: 'POST',
		   url: 'http://localhost:8080/verifyDigitalIdStatus/', 
		   data: data  
		}).then(function successCallback(response) {
			console.log(response);
			if(JSON.stringify(response) != '{}' && response.data.message == "Success"){
				$scope.success = true;			
			}else{
				$scope.failure = true;
			}				
		});		
	}	
	
	$scope.updateStatus = function(buttonValue){
		var digitalIdVerified = "No";
		
		if($scope.success){
			digitalIdVerified = "Yes";	
		}
		
		var data = {
				id: $scope.selectedApplicantData.digitalId,
				status : buttonValue,
				digitalIdVerified : digitalIdVerified
		};
	$http(
		{
		   method: 'POST',
		   url: 'http://localhost:8080/applicantDataStatus/', 
		   data: data  
		}).then(function successCallback(response) {
			if(JSON.stringify(response) != '{}' && response.data.status == "200"){
				window.location.replace("http://localhost:8080/requestTable.html");				
			}else{
				alert(response.data.message);
			}				
		});		
	}
	
	$scope.moveToRequestTable = function(clickedData){
		window.location.replace("http://localhost:8080/requestTable.html");						
	}
}]);