// Generate random background image
document.body.style.backgroundImage = `url("images/locations/${GetRandomNumber()}.jpg")`; 

if (RECENT_GAMES.length == 0) {
    document.getElementById("page-subtitle").style.display = "block";
    document.getElementById("delete-scores").style.display = "none";
} else {
    // User has recent games
    document.getElementById("leaderboard").style.display = "block";
}

var count = 0;
RECENT_GAMES.reverse().forEach(game => {
    count++;
    $("#scores-table").append(
        `
        <tbody id="tableBody" class="align-middle">
        <td>${count}</th>
        <td>${moment.unix(game.startDate).fromNow()}</th>
        <td>${game.rounds}</td>
        <td>${moment.utc((moment(game.endDate) - moment(game.startDate)) * 1000).format('mm:ss')}</td>
        <td>${game.score}</td>
        </tr>                 
        `);
});