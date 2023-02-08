var TOTAL_LOCATIONS = 60;
var RECENT_GAMES = [];

if (localStorage.getItem("recentGames") != null) {
    RECENT_GAMES = JSON.parse(localStorage.getItem("recentGames"));
}

/**
 * @description Deletes all localStorage high-scores
 */
function DeleteScores() {
    if (confirm("Are you sure you want to delete ALL high-scores?")) {
        localStorage.clear();
        location.reload();
    }
}

/**
 * 
 * @param {Number} rounds 
 * @returns {Array} Returns the best game a user has had with the same amount of rounds (Nullable)
 */
function GetBestGame(rounds) {
    var checkList = RECENT_GAMES.filter(game => game.rounds == rounds);
    if (checkList.length == 0) {
        return null;
    }
    return RECENT_GAMES.reduce((prev, current) => (prev.score > current.score) ? prev : current);
}

/**
 * @returns {Number} Random number between 0 and total number of locations
 */
function GetRandomNumber() {
    return Math.floor(Math.random() * (TOTAL_LOCATIONS));
}

/**
 * @param {Number} count Amount of numbers to fetch
 * @returns {Array} List of unique random numbers
 */
function GetRandomNumbers(count) {
    var numbers = [];

    while (numbers.length < count) {
        var randomNumber = GetRandomNumber();
        
        if (numbers.indexOf(randomNumber) === -1) {
            numbers.push(randomNumber);
        }
    }
    return numbers;
}

/**
 * @param {Array} coordinates Coordinates to be checked
 * @returns Location object (Nullable)
 */
function GetLocationFromCoordinates(coordinates) {
    for (var location of GAME_LOCATIONS) {
        if (`${[location.coordinates[1], location.coordinates[0]]}` == `${[coordinates.lat, coordinates.lng]}`) {
            return location;
        }
    }
    return null;
}

/**
 * @author https://stackoverflow.com/a/31813714/9537180
 * @param {Marker} checkMarker 
 * @param {Poly} poly
 * @returns {Boolean} True if the marker is inside a created polygon
 */
function IsMarkerInsidePolygon(checkMarker, poly) {
    var polyPoints = poly.getLatLngs()[0];       
    var x = checkMarker.getLatLng().lat, y = checkMarker.getLatLng().lng;

    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

/**
 * @description Adds invisible bounds to each in-game island
 */
function ConfigureIslandBounds() {
    var alderneyCoordinates = [[-820, -2026],[-726, -2274],[-278, -2344],[238, -2396],[1964, -1398],[2072, -970],[1962, -802],[1540, -674],[1493.5, -654],[1455.5, -662],[1302, -689],[1194.5, -709.5],[1130, -723.5],[1050, -750],[942.5, -776],[842.5, -769],[737.5, -777.5],[650.5, -823.5],[587.5, -870.5],[497.5, -899],[363, -898],[128, -910],[-16, -974],[-138, -962.5],[-262, -856],[-396, -824],[-547, -858.5],[-658.5, -947],[-774.5, -1108],[-820, -1325],[-835.5, -1598],[-840, -1904]];
    ISLAND_BOUNDS.push(["Alderney", L.polygon(alderneyCoordinates, {stroke: false, fill: false}).addTo(MAP)]);

    var happinessIslandCoordinates = [[-644.5, -711.90674],[-680, -773.90674],[-712, -807],[-753.5, -830],[-789.5, -804.5],[-854.5, -757],[-943, -707.5],[-1020.5, -670.5],[-1078.5, -612],[-1104.5, -553],[-1109, -482.5],[-1048.5, -434],[-1015, -381],[-950, -366.5],[-896.5, -387.5],[-850, -422],[-780.5, -466],[-709.5, -503.5],[-666.5, -527],[-628.5, -595.5],[-635, -685.5]];
    ISLAND_BOUNDS.push(["Happiness Island", L.polygon(happinessIslandCoordinates, {stroke: false, fill: false}).addTo(MAP)]);

    var algonquinCoordinates = [[1922, -383],[1854, -488],[1775, -565],[1485.5, -647],[1317.5, -679],[1197.25, -705],[1141.75, -717.75],[1072.75, -735.25],[942.5, -769.75],[756.5, -770.25],[603.75, -675.75],[513.75, -788],[210.25, -818],[21, -861.5],[-175.75, -810.5],[-360.5, -707.25],[-493, -569],[-725, -418.5],[-761, -353],[-874, -288.5],[-983, -207.5],[-1084, -148],[-1100, -16],[-934, 340],[-754.5, 444.5],[-584.5, 495],[-498.5, 531],[-314, 563],[-133, 595],[65, 571.5],[199.5, 612],[327, 604.5],[415, 549],[531, 409],[700, 349],[1085, 344],[1256, 314],[1404, 220],[1589, 116],[1824, 14],[2012, -187],[1991, -329]];
    ISLAND_BOUNDS.push(["Algonquin", L.polygon(algonquinCoordinates, {stroke: false, fill: false}).addTo(MAP)]); 

    var bohanCoordinates = [[2260, 692],[2238, 550],[2215, 385],[2143, 306],[1981, 236],[1888, 196],[1775, 75.5],[1746.75, 69.75],[1710.25, 78.75],[1652, 97.5],[1609.75, 119.75],[1516, 200],[1430, 260],[1381, 270],[1329, 298],[1290, 339],[1243, 360],[1190, 391],[1178, 463],[1165, 601],[1193, 690],[1230, 760],[1243, 804],[1248, 864],[1335, 893],[1371, 926],[1377, 998],[1387, 1066],[1388, 1110],[1330, 1117],[1299, 1152],[1283, 1207],[1290, 1284],[1313, 1332],[1333, 1452],[1504, 1456],[1553, 1514],[1653, 1556],[1840, 1569],[1907, 1511],[1995, 1413],[2049, 1366],[2237, 936]];
    ISLAND_BOUNDS.push(["Bohan", L.polygon(bohanCoordinates, {stroke: false, fill: false}).addTo(MAP)]); 

    var chargeIslandCoordinates = [[1161.25, 600.75],[1166.75, 533.5],[1140.25, 505.5],[1132.5, 381],[1057.75, 380],[1026.5, 348.5],[990.25, 348.75],[978, 438],[935, 425.5],[871, 415.75],[842.25, 397.5],[820.75, 362.5],[735.25, 379.25],[694.25, 408],[705, 457.25],[698, 480.25],[641.75, 486],[592.75, 509],[576, 537.25],[572.75, 586.75],[575.5, 656.25],[591.25, 746.5],[658, 746.75],[678.75, 728],[715.25, 705.25],[735, 711.5],[840, 712.5],[975.25, 702.5],[1069.5, 693.5],[1113.75, 657.75],[1131, 606]];
    ISLAND_BOUNDS.push(["Charge Island", L.polygon(chargeIslandCoordinates, {stroke: false, fill: false}).addTo(MAP)]);

    var brokerCoordinates = [[1163.5, 1483.5],[1328, 1449],[1321.25, 1403],[1285.25, 1291],[1151, 1245.5],[1181, 1206],[1182.5, 1131],[1197, 1088.5],[1174, 1038.5],[1076, 1005.5],[1049, 955],[1034, 865.5],[982, 829.5],[937, 801],[797, 797],[777.5, 764.25],[757.75, 764.5],[728.75, 812.5],[659, 749],[589.75, 748.75],[556, 775.5],[509, 760],[446.5, 721.5],[386.5, 713],[318, 711.25],[278.5, 610],[237, 612],[200.5, 670.75],[143.5, 663],[95.5, 599.25],[52.5, 589],[-6.5, 606.75],[-6.25, 652],[-81.5, 666.75],[-134.25, 652.75],[-200, 683.75],[-347.75, 632.75],[-391, 551.5],[-425, 546.25],[-447.75, 708],[-546.5, 695],[-633, 756.75],[-681, 696],[-735.25, 670],[-855.5, 685],[-900.75, 771.75],[-892, 884.25],[-976.25, 926.5],[-976.5, 952.75],[-879.5, 1014],[-835.75, 1121.25],[-819.75, 1233.75],[-887, 1271],[-941, 1360.75],[-947, 1441],[-854.5, 1473],[-813.5, 1489.25],[-773, 1474.75],[-723.75, 1478.75],[-652, 1441.5],[-563.25, 1493],[-508.75, 1600.75],[-338.25, 1572.5],[-219, 1524],[-134, 1476],[-47, 1694],[-114, 1723],[-128, 1793],[0, 1872],[-9, 2073],[-133, 2125],[-204, 2128],[-218, 2381],[21, 2667],[316, 2955],[558, 2971],[761, 2676],[945, 2367],[1043, 2148],[1132, 1918],[1180, 1853],[1207, 1747],[1225.25, 1627.5],[1197, 1498.75]];
    ISLAND_BOUNDS.push(["Broker", L.polygon(brokerCoordinates, {stroke: false, fill: false}).addTo(MAP)]);
}

/**
 * 
 * @param {Marker} marker 
 * @returns The in-game island that the marker is inside of
 */
function GetIslandFromMarker(marker) {
    for (var island of ISLAND_BOUNDS) {
        if (IsMarkerInsidePolygon(marker, island[1])) {
            return island[0];
        }
    }
}

/**
 * 
 * @param {Number} distance 
 * @returns Human-readable distance format.
 */
function GetReadableDistance(distance) {
    if (distance > 1000) {
        distance = `${(distance / 1000).toFixed(1)}km`;
    } else {
        distance += "m";
    }
    return distance;
}


