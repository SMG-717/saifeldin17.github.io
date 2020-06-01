let person = {
    'firstName': 'Saifeldin',
    'lastName': 'Mohamed',
    'favNumbers': [1, 55, 2, 6],
    fullName: function(message) {
        return this.firstName + " " + this.lastName + ' says: ' + message;
    }
};

function myFunc() {
    document.getElementById('par').innerHTML = person.fullName('Hello');
    console.log(person.fullName('Hello'));
}