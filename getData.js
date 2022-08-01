const fs = require("fs-extra");
const async = require("async");
const csv = require("csv-parser");
const TrieSearch = require('trie-search');

// TODO: understand what csv-parser is & createReadStream & pipe

/*----------------------------------------------------------------
constants 
/*----------------------------------------------------------------
// TODO: understand diff between obj and map: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
/**
 * const
 */
const userHashByID = new Map();
const userHashByCountry = new Map();
const userHashByYear = new Map();
// const userTrie = new TrieSearch("name",{min: 3});
const userTrie = new TrieSearch();

/*----------------------------------------------------------------
initiates 
/*----------------------------------------------------------------*/
// TODO: description of the function
/**
 * @function readDataFromCsvFileAndInitiate
 * reads the data from the CSV file and initiates.
 */
function readDataFromCsvFileAndInitiate() {
  fs.createReadStream("mockData.csv")
    .pipe(
      csv({
        mapHeaders: ({ header, index }) => header.toLowerCase(),
      })
    )
    .on("data", function (user) {
      addUserToId(user);
      addUserToCountry(user);
      addUserToYear(user);
      addUserToTrie(user)
    })
    .on("end", function () {
      console.log("Data loaded");
    });
}
/**
 * @function getAge
 * calc user age by DOB
 */
// TODO: really calculate the users age
const getUserYear = (dob) => {
  // const todayYear = new Date().getFullYear();
  const userYear = Number(dob.split("/")[2]);
  return userYear;
};

/*----------------------------------------------------------------
Adding 
/*----------------------------------------------------------------*/

/**
 * @function addUserToId
 * add user to Id to userHashByID Hash tabe
 */
const addUserToId = (user) => {
  userHashByID.set(user.id, user);
};
/**
 * @function addUserToCountry
 * add user to userHashByCountry Hash tabe
 */
const addUserToCountry = (user) => {
  const country = user.country.toLowerCase();
  // check if country already exists and add user to userHashByCountry
  if (userHashByCountry.get(country)) {
    const arrOfId = userHashByCountry.get(country);
    arrOfId.push(user.id);
    userHashByCountry.set(country, arrOfId);
  } else userHashByCountry.set(country, [user.id]);
};
/**
 * @function addUserToYear
 * add user to userHashByYear Hash tabe
 */
const addUserToYear = (user) => {
  const year = getUserYear(user.dob);
  if (userHashByYear.get(year)) {
    const arrOfId = userHashByYear.get(year);
    arrOfId.push(user.id);
    userHashByYear.set(year, arrOfId);
  } else userHashByYear.set(year, [user.id]);
};
/**
 * @function addUserToTrie
 * add user to addUserToTrie trie
 */
const addUserToTrie = (user) => {
  const name = user.name.replace(' ','%20')
  console.log(user.id,name);
  userTrie.map(name,user.id)
};
/*----------------------------------------------------------------
get 
/*----------------------------------------------------------------*/
/**
 * @function getUserById
 * get user by Id
 */
const getUserById = (id) => {
  id = id.toLowerCase();
  return userHashByID.get(id) ? userHashByID.get(id) : "User dosen't exist";
};
/**
 * @function getUserByCountry
 * get user by Country
 */
const getUserByCountry = (country) => {
  country = country.toLowerCase();
  return userHashByCountry.get(country)
    ? userHashByCountry.get(country)
    : "Country dosen't exist";
};
/**
 * @function getUserByAge
 * get user by Age
 */
const getUserByAge = (age) => {
  const year = new Date().getFullYear() - age;
  console.log(year);
  return userHashByYear.get(year)
    ? userHashByYear.get(year)
    : "Age dosen't exist";
};
/**
 * @function getUserByName
 * get user by Age
 */
// TODO: fix first and last name issue 
const getUserByName = (name) => {
  name = name.replace(' ','%20')
  return userTrie.search(name);
};

/*----------------------------------------------------------------
 delete
/*----------------------------------------------------------------*/
/**
 * @function deleteUser
 * Main function for deleteing a user.
 * calling all relevant function to delete the user.
 * and delete the user from userHashByID
 */
const deleteUser = (id) => {
  id = id.toLowerCase();
  // if user doesnt exists:
  const user = userHashByID.get(id);
  console.log(user);
  if (user) {
    deleteUserFromHashCountry(user.country, id);
    deleteUserFromHashAge(user.dob, id);
    userHashByID.delete(id);
  } else return "User id dosen't exist";
};
/**
 * @function deleteUserFromHashCountry
 * delete from userHashByCountry
 */
const deleteUserFromHashCountry = (country, id) => {
  country = country.toLowerCase();
  const arrOfId = userHashByCountry.get(country);
  const index = arrOfId.indexOf(id)
  if (index > -1) arrOfId.splice(index, 1);
  userHashByCountry.set(country, arrOfId);
};
/**
 * @function deleteUserFromHashAge
 * delete from userHashByAge
 */
const deleteUserFromHashAge = (dob, id) => {
  const userYear = getUserYear(dob);
  const arrOfId = userHashByYear.get(userYear);
  const index = arrOfId.indexOf(id)
  if (index > -1) arrOfId.splice(index, 1);
  userHashByYear.set(userYear, arrOfId);
};

/*----------------------------------------------------------------
Export 
/*----------------------------------------------------------------*/

module.exports = {
  readDataFromCsvFileAndInitiate,
  getUserById,
  getUserByCountry,
  getUserByAge,
  deleteUser,
  getUserByName
};
