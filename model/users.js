const data = require('./../getData')

module.exports = {
    getUserById: async function(id){
        console.log(`getUserById called with id: ${id}`);
        return data.getUserById(id);
    },

    getUsersByAge: async function(age) {
        console.log(`getUsersByAge called with age: ${age}`);
        return data.getUserByAge(age);
    },

    getUsersByCountry: async function(country) {
        console.log(`getUsersByCountry called with country: ${country}`);
        return data.getUserByCountry(country);
    },

    getUsersByName: async function(name) {
        console.log(`searchUsersByName called with name: ${name}`);        
        return data.getUserByName(name);
    },

    deleteUser: async function(id) {
        console.log(`deleteUser called with id: ${id}`);        
        return data.deleteUser(id)
    }
}