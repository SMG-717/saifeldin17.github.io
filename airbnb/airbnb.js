var listings;
function readTextFile() {
    let file = "listings.json";
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        // noinspection EqualityComparisonWithCoercionJS
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            listings = JSON.parse(rawFile.responseText);
            document.getElementById('display').innerHTML = listings.length + ' properties loaded from json';
        }
    };
    rawFile.send(null);
}

window.onload = function() {
    readTextFile();
};