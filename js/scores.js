// Generate random background image
document.body.style.backgroundImage = `url("images/locations/${GetRandomNumber()}.jpg")`; 

if (RECENT_GAMES.length == 0) {
    document.getElementById("page-subtitle").style.display = "block";
    document.getElementById("delete-scores").style.display = "none";
    throw new Error("No recent games!");
} else {
    // User has recent games
    document.getElementById("leaderboard").style.display = "block";
}

$("#scores-table").append(`<tbody id="tableBody" class="align-middle">`);

var count = 0;
RECENT_GAMES.reverse().forEach(game => {
    count++;
    $("#tableBody").append(
        `
        <tr>
        <td>${count}</th>
        <td>${moment.unix(game.startDate).fromNow()}</th>
        <td>${game.rounds}</td>
        <td>${moment.utc((moment(game.endDate) - moment(game.startDate)) * 1000).format('mm:ss')}</td>
        <td>${game.score} / ${game.rounds * 500}</td>
        </tr>                 
        `);
});

$("#scores-table").append(`</tbody>`);