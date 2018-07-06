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
        currentTimeMinutes = parseInt(moment().format("mm")),
        currentTimeHours = parseInt(moment().format("HH")),
        currentUnixTime = currentDate.unix(),
        currentUnixTimeUTC = moment.unix(currentTime).utc()._i,
        nextArrival,
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
            currentTime: currentTime,
            minutesAway: minutesAway,
            nextArrival: nextArrival
        });
        console.log(dateAdded);
    });

    //update schedule with database data or return error
    database.ref().on("child_added", function (childSnapshot) {

        //calculate minutes remaining using current time and frequency
        var childFrequency = childSnapshot.val().frequency
        minutesAway = childFrequency - (currentTimeMinutes % childFrequency);

        /*check if hours is above 12, if so remove 12 ***does not work***
        if (currentTimeHours > 12) {
            return currentTimeHours - 12;
        } else {
            return currentTimeHours;
        };*/

        //calculate the next train time based on minutes away and current time
        nextArrival = currentTimeHours + ":" + (currentTimeMinutes + minutesAway);

        //update table with new data
        $("#table").append("<tr><td id='" + childSnapshot.val().trainName + "'>" + childSnapshot.val().trainName + 
        "</td><td id='" + childSnapshot.val().destination + "'>" + childSnapshot.val().destination + "</td><td id='" + childSnapshot.val().frequency +
        "'>" + childSnapshot.val().frequency + "</td><td id='" + nextArrival + "'>" + nextArrival + "</td><td id='" + minutesAway + 
        "'>" + minutesAway + "</td></tr>");
        
        //set timer to update info every second ***console.logs update but the table does not***
        window.setInterval(function startTimer() {
            currentTimeMinutes = parseInt(moment().format("mm"));
            currentTimeHours = parseInt(moment().format("HH"));
            minutesAway = childFrequency - (currentTimeMinutes % childFrequency);
            nextArrival = currentTimeHours + ":" + (currentTimeMinutes + minutesAway);
            $(`#${nextArrival}`).text(nextArrival);
            $(`#${minutesAway}`).text(minutesAway);
            console.log(nextArrival);
            console.log(minutesAway);
        }, 1000);

        //alert that an error has occured if nothing is returned
    }, function(errorObject) {
        alert("Errors handled: " + errorObject.key);
    });
});