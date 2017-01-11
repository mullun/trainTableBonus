// Initialize Firebase

var config = {
  apiKey: "AIzaSyDV9Z1AZOCb9IcHi7EKf590PkQdRVSlUUc",
  authDomain: "traintwo-e414a.firebaseapp.com",
  databaseURL: "https://traintwo-e414a.firebaseio.com",
  storageBucket: "traintwo-e414a.appspot.com",
  messagingSenderId: "52605313748"
};

firebase.initializeApp(config);

// Create a variable to reference the database

var database = firebase.database();

// Initial Values
var namesAndTimes = [];

var nextTrainTime = "12:01 pm";
var timeTillNextTrain = 55;

// var newTrain = {
//       name : "",
//       destination : "",
//       firstTrainTime : "",
//       frequency : "",
//       nextArrival : "",
//       minutesAway : ""
//   };

// namesAndTimes.push(newTrain);
// console.log("names and trains = " + namesAndTimes);
// // Save the new train details in Firebase
// console.log("setting initial blank value");
// database.ref().set(namesAndTimes);

// If value in database changes, get a snapshot of the current data.
database.ref().on("value", function(snapshot) {

  var tempNamesAndTimes = snapshot.val();
  updateTable (tempNamesAndTimes);

});

// -------------------------------------------------------------
// Whenever a user clicks the submit-bid button
$("#submit-train-info").on("click", function(event) {
  // Prevent form from submitting
  event.preventDefault();

  // Get the input values
  var trainName = $('#train-name').val().trim();
  var destination = $('#destination').val().trim();
  var firstTrainTime = $("#first-train-time").val().trim();
  var frequency = $("#frequency").val().trim();

  // clear the input cells
  $('#train-name').val("");
  $('#destination').val("");
  $("#first-train-time").val("");
  $("#frequency").val("");

  console.log("New Train info received");
  console.log("trainName = " + trainName);
  console.log("destination = " + destination);
  console.log("firstTrainTime = " + moment(firstTrainTime, "HH:mm").format("h:mm a"));
  console.log("frequency = " + frequency);

  computeValuesAndUpdateDatabase(trainName, destination, firstTrainTime, frequency);
 
});
// ----------------------------------------------------------------

function computeValuesAndUpdateDatabase (trainName, destination, firstTrainTime, frequency) {


  console.log("New Train info received");
  console.log("trainName = " + trainName);
  console.log("destination = " + destination);
  console.log("firstTrainTime = " + moment(firstTrainTime, "HH:mm").format("h:mm a"));
  console.log("frequency = " + frequency);

  // Check to see if it already exists
  // if (trainName in namesAndTimes) 

  // keep a formatted version to update database
  var firstTrainTimeFormatted = moment(firstTrainTime, "HH:mm").format("h:mm a");

  firstTrainTime = moment(firstTrainTime, "HH:mm");
  var currentTime = moment();
  console.log("is first time before current time " + firstTrainTime.isBefore(currentTime));

  if (firstTrainTime.isBefore(currentTime)) {

    var tempMoment = firstTrainTime;

    while (tempMoment.isBefore(currentTime)) {
      tempMoment = moment(tempMoment).add(frequency, "minutes");
      console.log("frequency added to first train time");
      console.log(moment(tempMoment).format("h:mm a"));
    }

    nextTrainTime = moment(tempMoment).format("h:mm a");
    currentTime = moment();
    timeTillNextTrain = moment(tempMoment).diff(currentTime, "minutes");
    console.log("time till next train = " + timeTillNextTrain);

  } else {
    // time of first train is after current time
    timeTillNextTrain = moment(firstTrainTime).diff(currentTime, "minutes");
    console.log("time till next train = " + timeTillNextTrain);
    nextTrainTime = moment(firstTrainTime).format("h:mm a");
  }

  var newTrain = {
      name : trainName,
      destination : destination,
      firstTrainTime : firstTrainTimeFormatted,
      frequency : frequency,
      nextArrival : nextTrainTime,
      minutesAway : timeTillNextTrain
  };

  namesAndTimes.push(newTrain);
  console.log("names and trains getting set to database");
  // Save the new train details in Firebase
  database.ref().set(namesAndTimes);

}

// ----------------------------------------------------------------

var minuteUpdateTimer = setInterval (function() { updateTimes() }, 1 * 60 * 1000);

function updateTimes() {

  console.log("one minute passed");
  var numberOfTrains = namesAndTimes.length;
  console.log("number of trains = " + numberOfTrains);

  for (var i = 1; i < numberOfTrains; i ++) {
    // ------ compute the values 
    // keep a formatted version to update database
    var firstTrainTimeFormatted = moment(namesAndTimes[i].firstTrainTime, "HH:mm").format("h:mm a");
    var firstTrainTime = moment(namesAndTimes[i].firstTrainTime, "HH:mm");
    var currentTime = moment();
    var frequency = namesAndTimes[i].frequency; // local variable for calculations
    console.log("is first time before current time " + firstTrainTime.isBefore(currentTime));

    if (firstTrainTime.isBefore(currentTime)) {

      var tempMoment = firstTrainTime;

      while (tempMoment.isBefore(currentTime)) {
        tempMoment = moment(tempMoment).add(frequency, "minutes");
        console.log("frequency added to first train time");
      }

      var nextTrainTime = moment(tempMoment).format("h:mm a");
      currentTime = moment();
      var timeTillNextTrain = moment(tempMoment).diff(currentTime, "minutes");
      console.log("time till next train = " + timeTillNextTrain);

    } else {
      // time of first train is after current time
      var timeTillNextTrain = moment(firstTrainTime).diff(currentTime, "minutes");
      console.log("time till next train = " + timeTillNextTrain);
      var nextTrainTime = moment(firstTrainTime).format("h:mm a");
    }


    console.log("nextTrainTime = " + nextTrainTime);
    namesAndTimes[i].nextArrival = nextTrainTime;

    console.log("minutesAway = " + timeTillNextTrain);
    namesAndTimes[i].minutesAway = timeTillNextTrain;
  }

  console.log("names and trains = " + namesAndTimes);
  console.log("updated times getting set to database");
  // Save the new time details in Firebase
  database.ref().set(namesAndTimes);

}

// ----------------------------------------------------------------

function updateTable (tempNamesAndTimes) {
  var numberOfTrains = tempNamesAndTimes.length;
  namesAndTimes = [];
  $("#tableContentsDiv").empty();
  console.log("table getting updated");

  for (var i = 0; i < numberOfTrains; i++) {
    namesAndTimes.push(tempNamesAndTimes[i]);

    var trainNameDiv = $("<div>");
    trainNameDiv.addClass("train-name");
    trainNameDiv.addClass("col-sm-3");
    trainNameDiv.html("<b>"+namesAndTimes[i].name+"</b>");
    $("#tableContentsDiv").append(trainNameDiv);

    var destinationDiv = $("<div>");
    destinationDiv.addClass("columnDestination");
    destinationDiv.addClass("col-sm-3");
    destinationDiv.html("<b>"+namesAndTimes[i].destination+"</b>");
    $("#tableContentsDiv").append(destinationDiv);

    var frequencyDiv = $("<div>");
    frequencyDiv.addClass("columnFrequency");
    frequencyDiv.addClass("col-sm-2");
    frequencyDiv.html("<b>"+namesAndTimes[i].frequency+"</b>");
    $("#tableContentsDiv").append(frequencyDiv);

    var nextArrivalDiv = $("<div>");
    nextArrivalDiv.addClass("columnNextArrival");
    nextArrivalDiv.addClass("col-sm-2");
    nextArrivalDiv.html("<b>"+namesAndTimes[i].nextArrival+"</b>");
    $("#tableContentsDiv").append(nextArrivalDiv);

    var minutesAwayDiv = $("<div>");
    minutesAwayDiv.addClass("columnMinutesAway");
    minutesAwayDiv.addClass("col-sm-2");
    minutesAwayDiv.html("<b>"+namesAndTimes[i].minutesAway+"</b>");
    $("#tableContentsDiv").append(minutesAwayDiv);
  }
}
// ----------------------------------------------------------------
