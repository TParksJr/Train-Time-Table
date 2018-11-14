$(function () {

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
        currentTime = moment().format("HH:mm").toLocaleString(),
        currentTimeMinutes = parseInt(moment().format("mm")),
        currentTimeHours = parseInt(moment().format("HH")),
        nextArrival,
        minutesAway = 0;

    //on click event for submit button to add train
    $("#submit").on("click", function (event) {

        //prevent form from sending before updating data
        event.preventDefault();

        //get form values
        trainName = $("#trainName").val().trim(),
            destination = $("#destination").val().trim(),
            firstTrain = $("#firstTrain").val().trim(),
            frequency = $("#frequency").val().trim();

        //push data as an object into Firebase database
        database.ref().push({
            trainName: trainName,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP,
            currentTime: currentTime,
            minutesAway: minutesAway
        });
    });

    //update schedule with database data or return error
    database.ref().on("child_added", function (childSnapshot) {

        //calculate minutes remaining using current time and frequency
        var childFrequency = childSnapshot.val().frequency
        minutesAway = childFrequency - (currentTimeMinutes % childFrequency);

        //check if hours is above 12, if so remove 12 to convert to 12hr clock
        if (currentTimeHours > 12) {
            currentTimeHours -= 12;
        };

        //if minutes is above 59, subtract 60 min and add 1 hour
        if ((currentTimeMinutes + minutesAway) > 59) {
            currentTimeMinutes -= 60;
            currentTimeHours += 1;
            //calculate the next train time based on minutes away and current time with zero added to maintain format
            nextArrival = currentTimeHours + ":0" + (currentTimeMinutes + minutesAway);
        } else {
            //calculate the next train time based on minutes away and current time
            nextArrival = currentTimeHours + ":" + (currentTimeMinutes + minutesAway);
        };

        //update table with new data
        $("#table").append("<tr><td id='" + childSnapshot.val().trainName + "'>" + childSnapshot.val().trainName +
            "</td><td id='destination" + childSnapshot.val().trainName + "'>" + childSnapshot.val().destination + "</td><td id='frequency" + childSnapshot.val().trainName +
            "'>" + childSnapshot.val().frequency + "</td><td id='nextArrival" + childSnapshot.val().trainName + "'>" + nextArrival + "</td><td id='minutesAway" + childSnapshot.val().trainName +
            "'>" + minutesAway + "</td></tr>");

        //set timer to update info once every every second
        window.setInterval(function startTimer() {
            currentTimeMinutes = parseInt(moment().format("mm"));
            currentTimeHours = parseInt(moment().format("HH"));
            minutesAway = childFrequency - (currentTimeMinutes % childFrequency);
            // nextArrival = currentTimeHours + ":" + (currentTimeMinutes + minutesAway);

            //check if hours is above 12, if so remove 12 to convert to 12hr clock
            if (currentTimeHours > 12) {
                currentTimeHours -= 12;
                //if minutes is above 59, subtract 60 min and add 1 hour
                if ((currentTimeMinutes + minutesAway) > 59) {
                    currentTimeMinutes -= 60;
                    currentTimeHours += 1;

                    //calculate the next train time based on minutes away and current time with zero added to maintain standard format
                    nextArrival = currentTimeHours + ":0" + (currentTimeMinutes + minutesAway) + "PM";
                } else {
                    //calculate the next train time based on minutes away and current time
                    nextArrival = currentTimeHours + ":" + (currentTimeMinutes + minutesAway) + "PM";
                };
            } else {
                //if minutes is above 59, subtract 60 min and add 1 hour
                if ((currentTimeMinutes + minutesAway) > 59) {
                    currentTimeMinutes -= 60;
                    currentTimeHours += 1;

                    //calculate the next train time based on minutes away and current time with zero added to maintain standard format
                    nextArrival = currentTimeHours + ":0" + (currentTimeMinutes + minutesAway) + "AM";
                } else {
                    //calculate the next train time based on minutes away and current time
                    nextArrival = currentTimeHours + ":" + (currentTimeMinutes + minutesAway) + "AM";
                };
            };

            $("#nextArrival" + childSnapshot.val().trainName).text(nextArrival);
            $("#minutesAway" + childSnapshot.val().trainName).text(minutesAway);
        }, 1000);

        //alert that an error has occured if nothing is returned
    }, function (errorObject) {
        alert("Errors handled: " + errorObject.key);
    });
});