//   Initialize Firebase
var config = {
    apiKey: "AIzaSyDol-FwBLa9LmnH0nFd2RqqPGtXFWq6C50",
    authDomain: "dateknight-f4122.firebaseapp.com",
    databaseURL: "https://dateknight-f4122.firebaseio.com",
    projectId: "dateknight-f4122",
    storageBucket: "dateknight-f4122.appspot.com",
    messagingSenderId: "144687519953"
};
firebase.initializeApp(config);
var database = firebase.database();

//FIREBASE ANON LOGIN STUFF -----------------------------
var auth = firebase.auth();
firebase.auth().signInAnonymously().catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
});
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        uid = user.uid;
        // ...
    } else {
        // User is signed out.
        // ...
    }
    // ...
    console.log("This is the anon ID in scope", uid);
});
//FIREBASE ANON LOGIN STUFF -----------------------------

//Global variables. These empty arrays will have information pushed into them from the initial ajax calls. 
var uid = ""
var locations = []
var newMarkerName = []
var newMarkerImage = []
var newMarkerAddress = []
var newMarkerPhone = []
var newMarkerRating = []
var newMarkerReviews = []
var markerContent = []

//FIREBASE ARRAYS-------------------------------------- 
//These variables hold the data pushed from the event listeners attached to firebase.
var userOne = []
var userTwo = []
var uniqueNames = [];
var uniqueActivities = [];
//FIREBASE ARRAYS-------------------------------------- 

// Ambreen - working on hide(); element to separate the Activity and Cuisine search
$(document).ready(function () {
    $("#activity-div").hide();
    $("#next-pick-an-activity").hide();
    $("#date-knight-picks").hide();
    $("#results-wrapper").hide();

    // This is for the "Click Here to select a Date Activity" button
    $(document).on("click", "#pick-activity-btn", function () {

        $("#cuisine-div").hide();
        $("#activity-div").show();

        resetResults();
    });
    //created function to render results
    function renderResults(resultType, totalResults, data) {

        if (totalResults > 0) {
            // Display a header on the page with the number of results
            $('#announce-results').append("Here are the results!");
            // Itirate through the JSON array of 'businesses' which was returned by the API
            $.each(data.businesses, function (i, item) {
                // Store each business's object in a variable
                var id = item.id;
                // var alias = item.alias;
                var phone = item.display_phone;
                var image = item.image_url;
                var name = item.name;
                var rating = item.rating;
                var reviewcount = item.review_count;
                var address = item.location.address1;
                var city = item.location.city;
                var state = item.location.state;
                var lAddress = item.location.display_address;
                var zipcode = item.location.zip_code;
                var coordinates = item.coordinates;
                var yelpsite = item.url;

                //PUSHING THE BELOW TO GLOBAL VARIABLES FOR MARKER MANIPULATION LATER
                locations.push(coordinates);
                newMarkerName.push(name);
                newMarkerImage.push(image);
                newMarkerAddress.push(lAddress);
                newMarkerPhone.push(phone)
                newMarkerRating.push(rating)
                newMarkerReviews.push(reviewcount)
                //--------------------------------------------------

                var restaurantResultHtml = `
                <div class="card">
                    <a href="#ex1`+i+`" rel="modal:open">
                    <img src="${image}" class="card-img-top" alt="${name}">
                    </a>
                    <div id="ex1`+i+`" class="modal">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">${address} <br> ${city} , ${state} ${zipcode} <br> ${phone} <br> Rating: ${rating}</p>
                    <a href="${yelpsite}" class="btn btn-primary " target="_blank">View on Yelp</a>
                    <button class="btn btn-primary likeRestaurantButton" id="save-selection" data-name="${name} ">I Like This Restaurant</button>
                    <br><br>
                    <a href="#" rel="modal:close">Close</a>
                    </div>
                </div>
                `;
                var activityResultHtml = `
                <div class="card">
                    <a href="#ex1" rel="modal:open">
                    <img src="${image}" class="card-img-top" alt="${name}">
                    </a>
                    <div id="ex1" class="modal">
                    <h5 class="card-title">${name}</h5>
                    <p class="card-text">${address} <br> ${city} , ${state} ${zipcode} <br> ${phone} <br> Rating: ${rating}</p>
                    <a href="${yelpsite}" class="btn btn-primary " target="_blank">View on Yelp</a>
                    <button class="btn btn-primary likeActivitiesButton" id="save-selection" data-name="${name} ">I Like This Activity</button> 
                    <br><br>
                    <a href="#" rel="modal:close">Close</a>
                    </div>
                </div>
                `;




                // Append our result into our page

                //will append restaurant-type button to restaurant results, and activity-type button to activity results
                if (resultType == "restaurant") {
                    $('#results').append(restaurantResultHtml);
                } else {
                    $('#results').append(activityResultHtml);
                    $("#date-knight-picks").show();
                }
            });
        } else {
            // If our results are 0; no businesses were returned by the JSON therefor we display on the page no results were found
            $('#announce-results').append('<h5>We discovered no results!</h5>');
        }

    }

    // Creating code to restrict number of characters in the zipcode field. 

    var character_limit = 4;

    $('#inputZip').keydown(function () {
        if ($(this).val().length >= character_limit) {
            $(this).val($(this).val().substr(0, character_limit));
        }
    });

   


    function fetchResults(input) {

        

        // display the map div
        $("#map").show();

        // display the results wrapper div
        $("#results-wrapper").show();

// remove the "enter zip code" message div
// $("#message-div").hide();

        console.log("button clicked")
        zipcode = $("#inputZip").val();
        // console.log(zipcode)
        activity = $("#activity-input").val();
        cuisine = $("#cuisine-input").val();

        if (activity == "Choose...") {
            input = cuisine;
            resultType = "restaurant";
            // this will display the Activity input field and the "Click here to select a Date Activity" button
            $("#next-pick-an-activity").show();
        } else {
            input = activity;
            resultType = "activity";
        }

        var myurl = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=by-" + input + "&location=" + zipcode + "&limit=3";

        console.log(input);
        $.ajax({
            url: myurl,
            headers: {
                'Authorization': 'Bearer Nzuf7W7Q8AlGEUYy2or2Ws5m1jj_nmsTw2YZrH-rnyTeK8ijSbkXFOGC3Wn0rU_yJLMwssYKjl4ubv-9oCeoLkF-WEBckSTLdA3qnRGe9V1R6DK3_U0VdHRMvp2_XHYx',
            },
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                // Grab the results from the API JSON return
                dataVar = data
                var totalResults = data.total;
                console.log("Results: ", data);

                //this is what calls the rendering of the results on the html:
                renderResults(resultType, totalResults, data);

                // this scrolls to the results div once the results are displayed
                var scroll = document.getElementById("announce-results");
                scroll.scrollIntoView({ behavior: "smooth" });

                //TODO: Put things that will happen in the AJAX event, but outside of the Loop below here
                // ------------------------------------------------------------------------------------------
                //DONE: Display the map
                displayMap();

                $(".likeRestaurantButton").on("click", function () {
                    thisClicked = $(this).data("name")
                    var restaurantNameObject = {
                        Name: thisClicked
                    };
                    //DONE push the selected items into an array
                    var rootRef = database.ref("users");
                    var restaurantsRef = rootRef.child(uid);
                    restaurantsRef.child("/restaurants").push(restaurantNameObject)

                });

                database.ref('users/' + uid + '/restaurants').on("child_added", function (child) {
                    console.log("PLEASE I BEG YOU TO WORK");
                    console.log(child);
                    var childAdded = child.node_.children_.root_.value.value_

                    userOne.push(childAdded);
                    $.each(userOne, function (i, el) {
                        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                    });

                    console.log("new userOne", userOne);
                    console.log("new uniqueNames", uniqueNames);
                })


                $(".likeActivitiesButton").on("click", function () {
                    // We will push thisClicked to firebase
                    thisClicked = $(this).data("name")
                    var activitiesNameObject = {
                        Name: thisClicked
                    };
                    //This pushes the selected Activities into Firebase folder for /activities. 
                    var rootRef = database.ref("users");
                    var activitiesRef = rootRef.child(uid);
                    activitiesRef.child("/activities").push(activitiesNameObject)

                });

                //DONE: Success! Items pushed properly to the database. 
                database.ref('users/' + uid + '/activities').on("child_added", function (child) {
                    var childAddedActivities = child.node_.children_.root_.value.value_
                    userTwo.push(childAddedActivities);
                    //userOne is variable that holds the pushed array
                    //This array will prevent duplicate items in the array from being duplicated    

                    $.each(userTwo, function (i, elel) {
                        if ($.inArray(elel, uniqueActivities) === -1) uniqueActivities.push(elel);
                    });

                    console.log("new userTwo activities", userTwo);
                    console.log("new userTwo unique array", uniqueActivities);
                })


                //TODO: Clear the uniqueNames array to [];
                $("#resetArray").on("click", function () {
                    //The below line will clear the database!
                    database.ref('users/'+ uid).remove();
                    userOne = [];
                    userTwo = [];
                    uniqueNames = [];
                    uniqueActivities = [];
                    window.location.reload();
                    // console.log("the current array is this after clearArray", uniqueNames)
                })

                database.ref().on("child_removed", function () {
                    userOne = [];
                    userTwo = [];
                    uniqueNames = [];
                    uniqueActivities = [];
                    console.log("uniqueNames and uniqueActivites arrays and Firebase are both cleared", uniqueNames, uniqueActivities);


                })

                //TODO: Have the date knight picka  random thing and output it. 
                $("#pickDate").on("click", function () {
                    $("#results-wrapper").hide();
                    $("#input-container").hide();
                    $("#instructions").hide();
                    var dkPickRestaurant = uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
                    $("#dkRestaurantPick").text("The Restaurant you should eat at is: " + dkPickRestaurant);
                    var dkPickActivity = uniqueActivities[Math.floor(Math.random() * uniqueActivities.length)];
                    $("#dkActivityPick").text("The thing you two should do after is: " + dkPickActivity)

                })

                // ------------------------------------------------------------------------------------------
            }
        });

    }
    // Reset button function
    $(document).on("click", "#reset", function () {
        console.log("Aloha!!!");
        resetResults();
        $("#cuisine-div").show();
        $("#activity-div").hide();
    });

    function resetResults() {
        $("#results").empty();
        $("#map").empty();
        $("#announce-results").empty();
        $("#inputZip").val("");
        $("#activity-input").prop("selectedIndex", 0);
        $("#cuisine-input").prop("selectedIndex", 0);
        $("#results-wrapper").hide();
        $("#next-pick-an-activity").hide();
    }
    //Leon created the dataVar and set it global to = the 'data' from the JSON object. This way he can manipulate the data within the displayMap(); function */
    var dataVar = ""
    // create a function that gets the value on click
    $("#results").empty();
    $("#submit").on("click", fetchResults );



    $("#submit").on("click", displayResultDiv);

     
        

            


    // create a function that shifts focus on the results div
    function displayResultDiv() {
        var resultDiv = document.getElementById("results");
        resultDiv.scrollIntoView();

      
// Display text when fields are blank and User click on Submit

     
if (document.getElementById("inputZip").value.length == 0) {
    console.log("AMBREEEEEEEEN!!!!!!!!!")
    $("#results-wrapper").hide();
$("#message-div").text("Please Enter a Zip Code and make a selection to continue");
}
    }

    function displayMap() {
        console.log("Leon's Locations var:", locations);

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            //DONE: The center of the maps is grabbied via the first business's latitude and longitutde coordinates. 
            center: new google.maps.LatLng(dataVar.businesses[0].coordinates.latitude, dataVar.businesses[0].coordinates.longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        //TODO: based on the length of the search results, push the longitude and latitude into the markers

        var infowindow = new google.maps.InfoWindow();

        for (i = 0; i < locations.length; i++) {

            //Variables to hold the Names, URL, map, phone number, yelp stars

            marker = new google.maps.Marker({
                position: new google.maps.LatLng(locations[i].latitude, locations[i].longitude),
                map: map
            });

            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    markerContent =
                        `
                <div id = "markerContent"> <img src ="${newMarkerImage[i]}" class = "markerImage">, 
                <p>
                    <h5>${newMarkerName[i]}</h5><br>
                    <strong>Address: </strong>${newMarkerAddress[i]} <br> 
                    <strong>Phone No: </strong>${newMarkerPhone[i]}<br>
                    <strong>Rating: </strong>${newMarkerRating[i]}<br>
                    <strong># of Reviews: </strong>${newMarkerReviews[i]}</p>
                </div>
                    `
                    infowindow.open(map, marker);
                    infowindow.setContent(markerContent);
                }
            })(marker, i));
        }
    };
    //Animated text

    $('.ml2').each(function () {
        $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

    anime.timeline({ loop: false })
        .add({
            targets: '.ml2 .letter',
            scale: [4, 1],
            opacity: [0, 1],
            translateZ: 0,
            easing: "easeOutExpo",
            duration: 250,
            delay: function (el, i) {
                return 70 * i;
            }
        }).add({
            targets: '.ml2',
            opacity: 1,
            duration: 1000,
            //   easing: "easeOutExpo",
            delay: 1000
        });

    $('.ml3').each(function () {
        $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

    anime.timeline({ loop: false })
        .add({
            targets: '.ml3 .letter',
            scale: [4, 1],
            opacity: [0, 1],
            translateZ: 0,
            easing: "easeOutExpo",
            duration: 1500,
            delay: function (el, i) {
                return 70 * i;
            }
        }).add({
            targets: '.ml3',
            opacity: 1,
            duration: 1000,
            //   easing: "easeOutExpo",
            delay: 1000
        });
});

