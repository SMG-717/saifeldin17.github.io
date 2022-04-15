function Chess() {

    var board = [];
    for (let i = 0; i < 8; i++) {
        let row = Array(8).fill(undefined);
        board.push(row);
    }

    function move(startx, starty, endx, endy) {
        if (isNaN(startx) || isNaN(starty) || isNaN(endx) || isNaN(endy)) return;
        board[endy][endx] = board[starty][startx];
        board[starty][startx] = undefined;
    }

    function check(startx, starty, endx, endy) {
        if (isNaN(startx) || isNaN(starty) || isNaN(endx) || isNaN(endy)) return false;
    }

    return {
        put: function() {

        }
    }
}
