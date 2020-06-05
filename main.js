window.onload = () => {
    document.getElementById('rand-btn').onclick = createRandomString;
};

function createRandomString(length) {
    if (isNaN(length)) {
        length = 25;
    }

    let text = '';
    let characters = 'abcdefghijklmonpqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * characters.length);
        text += characters.charAt(index);
    }
    console.log(text);
}

