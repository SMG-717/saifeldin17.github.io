var listings;
function getListings() {
    let file = "listings.json";
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status === 200) {
            listings = JSON.parse(rawFile.responseText);
        }
    };
    rawFile.send();
}

function showListings(min, max, sort) {
    let possibleSorts = ['default', 'alphabetical', 'alphabetical descending', 'price', 'price descending'];

    min = isNaN(min) ? 0 : Number(min);
    max = isNaN(max) ? Infinity : Number(max);
    sort = possibleSorts.indexOf(sort) === -1 ? 'default' : sort;

    let displayedList = [];
    for (let i = 0; i < listings.length; i++) {
        let price = listings[i].price;
        if (price < min || price > max) {
            continue;
        } else {
            displayedList.push(listings[i]);
        }
    }

    /* TODO Sort list here */

    let displayedText = '<p>Results found: ' + displayedList.length + '</p>';
    displayedText +='<table><tr><td></td><td>Name</td><td>Price</td><td>Borough</td></tr>';
    for (let i = 0; i < displayedList.length; i++) {
        let name = displayedList[i].name;
        let price = displayedList[i].price;
        let hood = displayedList[i].hood;
        displayedText += '<tr><td>' + (i + 1) + '. </td>';
        displayedText += '<td>' + name + '</td>';
        displayedText += '<td>£' + price + '</td>';
        displayedText += '<td>' + hood + '</td></tr>';
    }

    document.getElementById('prop-list').innerHTML = displayedText + '</table>';
}

window.onload = function() {
    getListings();
    document.getElementById('submit-btn').onclick = function() {
        let min = document.getElementById('min').value;
        let max = document.getElementById('max').value;
        showListings(min, max);
    }
};