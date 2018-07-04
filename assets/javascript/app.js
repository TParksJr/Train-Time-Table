$(function() {

    console.log("ready");

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyD2g0BH0tsoLqSb1NHVPG91RjoMXv0Ob8c",
        authDomain: "sample-project-8baa3.firebaseapp.com",
        databaseURL: "https://sample-project-8baa3.firebaseio.com",
        projectId: "sample-project-8baa3",
        storageBucket: "sample-project-8baa3.appspot.com",
        messagingSenderId: "81051139855"
    };
    firebase.initializeApp(config);

    //declare variables and set initial values
    var database = firebase.database(),
        trainName = "",
        destination = "",
        firstTrain = "",
        frequency = 0,
        dateAdded = "",
        currentDate = moment(),
        currentTime = moment().format("HH:mm"),
        currentTimeMinutes = moment().format("mm"),
        currentUnixTime = currentDate.unix(),
        currentUnixTimeUTC = moment.unix(currentTime).utc()._i,
        nextArrival = "",
        minutesAway = 0;

    //on click event for submit button to add train
    $("#submit").on("click", function(event) {
    
        //prevent form from sending before updating data
        event.preventDefault();

        //get form values
        trainName = $("#trainName").val().trim(),
        destination = $("#destination").val().trim(),
        firstTrain = $("#firstTrain").val().trim(),
        frequency = $("#frequency").val().trim();
        
        //console log form values to confirm
        console.log(trainName);
        console.log(destination);
        console.log(firstTrain);
        console.log(frequency);

        //push data as an object into Firebase database
        database.ref().push({
            trainName: trainName,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP,
            currentTime: currentTime
        });
        console.log(dateAdded);
    });

    //update schedule with database data or return error
    database.ref().on("child_added", function (childSnapshot) {

        //calculate next train time and minutes remaining ***does not work***
        minutesAway = currentTimeMinutes % frequency;
        console.log(minutesAway);
        nextArrival = currentTimeMinutes + minutesAway;
        console.log(nextArrival);

        //update table with new data
        $("#table").append("<tr><td id='" + childSnapshot.val().trainName + "'>" + childSnapshot.val().trainName + 
        "</td><td id='" + childSnapshot.val().destination + "'>" + childSnapshot.val().destination + "</td><td id='" + childSnapshot.val().frequency +
        "'>" + childSnapshot.val().frequency + "</td><td id='" + nextArrival + "'>" + nextArrival + "</td><td id='" + minutesAway + 
        "'>" + minutesAway + "</td></tr>");
        
        //set timer to update info every second
        window.setInterval(function startTimer() {
            $(`#${childSnapshot.val().trainName}`).text(childSnapshot.val().trainName);
            $(`#${childSnapshot.val().destination}`).text(childSnapshot.val().destination);
            $(`#${childSnapshot.val().frequency}`).text(childSnapshot.val().frequency);
            $(`#${childSnapshot.val().nextArrival}`).text(childSnapshot.val().nextArrival);
            $(`#${childSnapshot.val().minutesAway}`).text(childSnapshot.val().minutesAway);
            console.log(childSnapshot.val().trainName);
            console.log(childSnapshot.val().destination);
            console.log(childSnapshot.val().frequency);
            console.log(childSnapshot.val().nextArrival);
            console.log(childSnapshot.val().minutesAway);
        }, 1000);

        //alert that an error has occured if nothing is returned
    }, function(errorObject) {
        alert("Errors handled: " + errorObject.key);
    });
});