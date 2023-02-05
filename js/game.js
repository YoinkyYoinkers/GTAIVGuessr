// Get and set difficulty and round count.

var DEFAULT_DIFFICULTY = 2;
var DEFAULT_ROUNDS = 5;
var CURRENT_ROUND = 1;
var GUESSES = [];

var parameters = new URLSearchParams(window.location.search);

var DIFFICULTY = parameters.get("difficulty") == null ? 2 : parameters.get("difficulty");
var TOTAL_ROUNDS = parameters.get("rounds") == null ? 5 : parameters.get("rounds");	

if (DIFFICULTY > 3 || DIFFICULTY < 1) { DIFFICULTY = DEFAULT_DIFFICULTY; }
if (TOTAL_ROUNDS > 20 || TOTAL_ROUNDS < 3) { TOTAL_ROUNDS = DEFAULT_ROUNDS; }

var MAP = L.map('map', {
    renderer: L.canvas(),
    crs: L.CRS.Simple,
    center: [1500, 1500],
    minZoom: -2,
    maxZoom: 2,
    scrollWheelZoom: true,
    zoomControl: false
}).setView([1500, 1500], -1);

bounds = [new L.LatLngBounds([-3000, 3000], [3000,-3000])];

L.imageOverlay("images/map.png", bounds, {
}).addTo(MAP);

MAP.fitBounds(bounds, {padding: [200, 200]});

var SIDEBAR = L.control.sidebar('sidebar', {
    position: 'left',
    closeButton: false
});


var locationIds = GetRandomNumbers(TOTAL_ROUNDS);
var LOCATIONS = [];
locationIds.forEach(location => {
    LOCATIONS.push(GAME_LOCATIONS[location]);
});

var CURRENT_LOCATION = LOCATIONS[0];

SIDEBAR.on('shown', function () {
    document.getElementById("image").src = `images/locations/${CURRENT_LOCATION["id"]}.jpg`; 
});

MAP.addControl(SIDEBAR);

setTimeout(function () {
    SIDEBAR.show();
}, 500);

var ISLAND_BOUNDS = [];
ConfigureIslandBounds();


$("#hintLocation").text(`Location ${1}/${TOTAL_ROUNDS}`);


var PLACED_MARKER;
MAP.on('click', function(e) {
    if (PLACED_MARKER) {
        MAP.removeLayer(PLACED_MARKER);
    }

    PLACED_MARKER = new L.marker(e.latlng, {
        draggable: true,
        icon: L.icon({
            iconUrl: "images/icons/waypoint.png",
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        })
    }).addTo(MAP);

    $("#submitButton").removeAttr('disabled');
});

var CORRECT_MARKER;
var DISTANCE_LINE;

var ALL_MARKERS = [];
var POLY_LINES = [];

$(document).ready(function() {
    $("#submitButton").click(function() {
        var markerCoordinates = PLACED_MARKER.getLatLng();

        var correctCoordinates = [CURRENT_LOCATION["coordinates"][1], CURRENT_LOCATION["coordinates"][0]];

        var distance = Math.round(MAP.distance(markerCoordinates, correctCoordinates));
        var checkDistance = distance;
        
        distance = GetReadableDistance(checkDistance);

        MAP.removeLayer(PLACED_MARKER);

        PLACED_MARKER = new L.marker(PLACED_MARKER.getLatLng(), {
            interactive: false,
            icon: L.icon({
                iconUrl: "images/icons/waypoint.png",
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            })
        }).addTo(MAP);

        CORRECT_MARKER = new L.marker(correctCoordinates, {
            interactive: true,
            icon: L.icon({
                iconUrl: "images/icons/destination.png",
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            })
        }).addTo(MAP);

        var zoom;
        var resultText;
        var duration;
        var points = 0;
        
        if (checkDistance < 200) {
            if (checkDistance < 50) {
                zoom = 2.0;
                resultText = checkDistance <= 25 ? "Got it!" : "Close";
                MAP.options.maxZoom = 3;
                duration = 0.5;
            } else {
                zoom = 1.5;
                resultText = "Right Area!";
                duration = 1;
            }
           
        } else {
            resultText = "Not quite!";
            zoom = 0;
            duration = 2.5
        }

        if (checkDistance <= 25) {
            points = 500;
        } else {
            points = 500 - Math.round((checkDistance * 1.45));

            if (points < 0) {
                points = 0;
            }
        }

        if (zoom == 0 && (GetIslandFromMarker(PLACED_MARKER) == GetIslandFromMarker(CORRECT_MARKER))) {
            resultText += "<br><span id='right-island'>You were on the right Island, though!</span>";
        }

        MAP.flyTo(CORRECT_MARKER.getLatLng(), zoom, {
            duration: duration
        });

        DISTANCE_LINE = L.polyline([markerCoordinates, correctCoordinates], {
            color: "#577c58",
            weight: 6}).addTo(MAP);
            
        document.getElementById("resultText").innerHTML = resultText;
        document.getElementById("guessText").innerHTML = `<br>You were <b>${distance}</b> away from the correct location, scoring <b>${points}</b> points.`;

        GUESSES.push([PLACED_MARKER, CORRECT_MARKER, points]);

        document.getElementById("submitButton").style.display = "none";
        if (CURRENT_ROUND == TOTAL_ROUNDS) {
            document.getElementById("breakdownButton").style.display = "block";
        } else {
            document.getElementById("nextButton").style.display = "block";
        }
    });

    $("#nextButton").click(function() {
        MAP.removeLayer(PLACED_MARKER);
        MAP.removeLayer(CORRECT_MARKER);
        MAP.removeLayer(DISTANCE_LINE);

        CURRENT_LOCATION = LOCATIONS[CURRENT_ROUND];
        CURRENT_ROUND++;

        $("#hintLocation").text(`Location ${CURRENT_ROUND}/${TOTAL_ROUNDS}`);

        MAP.flyTo([0, 0], -2);
        
        document.getElementById("image").src = `images/locations/${CURRENT_LOCATION["id"]}.jpg`;    
        
        document.getElementById("resultText").innerHTML = "";
        document.getElementById("guessText").innerHTML = ""; 
        
        document.getElementById("nextButton").style.display = "none";
        document.getElementById("submitButton").style.display = "block";
        document.getElementById("submitButton").setAttribute('disabled', true);
    });

    $("#breakdownButton").click(function() {
        document.getElementById("image").remove();
        
        document.getElementById("breakdownButton").style.display = "none";
        document.getElementById("resultText").innerHTML = "";
        document.getElementById("guessText").innerHTML = ""; 

        document.getElementById("breakdown").innerHTML = "BREAKDOWN";
        document.getElementById("breakdown-content").style.display = "block";

        var timeLeft = 5;
        document.getElementById("playAgainButton").style.display = "block";
        $("#playAgainButton").attr('disabled', 'true');
        $("#playAgainButton").html(`${timeLeft}...`);

        var buttonCountdown = setInterval(function() {            
            timeLeft--;

            if (timeLeft <= 0) {
                clearInterval(buttonCountdown);
                $("#playAgainButton").removeAttr('disabled');
                $("#playAgainButton").html("play again!");
                return;
            }

            $("#playAgainButton").html(`${timeLeft}...`);
        }, 1000);

        guessCount = 0;
        totalPoints = 0;
        for (var guess of GUESSES) {
            guessCount++;
            
            totalPoints += guess[2];

            var chosenCoordinates = guess[0].getLatLng();
            var correctCoordinates = guess[1].getLatLng();
    
            var locationDetails = GetLocationFromCoordinates(correctCoordinates);
            var actualDistance = Math.round(MAP.distance(chosenCoordinates, correctCoordinates));
            
            var readableDistance = GetReadableDistance(actualDistance);
       
            var chosenMarker = new L.marker(chosenCoordinates, {
                interactive: true,
                icon: L.icon({
                    iconUrl: "images/icons/waypoint.png",
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                })
            }).addTo(MAP);
    
            var locationMarker = new L.marker(correctCoordinates, {
                interactive: true,
                icon: L.icon({
                    iconUrl: "images/icons/destination.png",
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(MAP);
    
            ALL_MARKERS.push([chosenMarker, locationMarker]);
    
            var chosenIslandText = GetIslandFromMarker(chosenMarker);
            var locationIslandText = GetIslandFromMarker(locationMarker);
            
            var icon = "<span id='incorrectIcon'>\u274C</span>";
            if (actualDistance <= 25) {
                icon = "<span id='correctIcon'>\u2714</span>";
            }
    
            $("#breakdown-table").append(
                `
                <tbody id="tableBody" class="align-middle">
                <tr onmouseover="onRowHover(${guessCount})" onmouseleave="onRowLeave(${guessCount})" onmousedown="onRowClick(${guessCount})">
                <th>${guessCount}</th>
                <td>${locationIslandText}</td>
                <td>${readableDistance}</td>
                <td>${icon}</td>
                <td>${guess[2]}</td>
                </tr>                 
                `);
                            
            chosenMarker.bindTooltip(`Guess ${guessCount}, ${readableDistance} away [<b>${guess[2]}</b> points].`);
            locationMarker.bindTooltip(`Guess ${guessCount}, ${readableDistance} away.<br><img id="tooltip-image" src="images/locations/${locationDetails.id}.jpg" /><br><span id="tooltip-location">${locationDetails.description}.<br><span id="tooltip-location-points"<b>${guess[2]}</b> points.</span></span>`, {
                opacity: 1,
                direction: "right",
                
            });
            POLY_LINES.push({
                id: guessCount,
                line: L.polyline([guess[0].getLatLng(), guess[1].getLatLng()], {color: "#577c58", weight: 6}).addTo(MAP)
            });               
        }


        $("#total-points").html(`${totalPoints}/${TOTAL_ROUNDS * 500}`);

        document.getElementById("sidebar").style.width = "25vw";
        document.getElementById("hintBox").style.height = "2.5vh";
        document.getElementById("hintText").innerHTML = "Hover over a marker to view details.";
    });

    $("#playAgainButton").click(function() { 
        window.location.reload();
    });

    $("#exitButton").click(function() { 
        window.location.href="index.html";
    });
});

var HIDDEN_LINES = [];
var HIDDEN_MARKERS = [];

function onRowHover(id) {
    
    POLY_LINES[id-1].line.setStyle({
        color: "#699f6a"
    });  

}

function onRowLeave(id) { 
    for (i = 0; i < HIDDEN_LINES.length; i++) {
        MAP.addLayer(HIDDEN_LINES[i]);      
    }

    for (j = 0; j < HIDDEN_MARKERS.length; j++) {
        MAP.addLayer(HIDDEN_MARKERS[j][0]);
        MAP.addLayer(HIDDEN_MARKERS[j][1]);
    }

    HIDDEN_LINES = [];
    HIDDEN_MARKERS = [];

    POLY_LINES[id-1].line.setStyle({
        color: "#577c58"
    });
}

function onRowClick(id) {

    /* To fix
    
    for (i = 0; i < POLY_LINES.length; i++) {  
        HIDDEN_LINES.push(POLY_LINES[i].line);
        HIDDEN_MARKERS.push(ALL_MARKERS[i]);
    }  

    for (j = 0; j < HIDDEN_LINES.length; j++) {
        if (HIDDEN_LINES[j] != POLY_LINES[id-1].line) {
            MAP.removeLayer(HIDDEN_LINES[j]);        
        }
    }

    for (k = 0; k < HIDDEN_MARKERS.length; k++) {
        if (HIDDEN_MARKERS[k] != ALL_MARKERS[id-1]) {
            MAP.removeLayer(HIDDEN_MARKERS[k][0]);
            MAP.removeLayer(HIDDEN_MARKERS[k][1]);
        }
    }
    */


    MAP.flyToBounds(POLY_LINES[id-1].line.getBounds(), {maxZoom: 1});
}