var data;

function createRandomString(length) {
    if (isNaN(length)) {
        length = 15;
    }

    let text = '';
    let characters = 'abcdefghijklmonpqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * characters.length);
        text += characters.charAt(index);
    }
    console.log(text);
}

function readTextFile() {
    file = "data.json"
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            data = JSON.parse(rawFile.responseText);
            console.log(data);
        }
    };
    rawFile.send(null);
}

