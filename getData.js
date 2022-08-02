const fs = require("fs-extra");
const async = require("async");
const csv = require("csv-parser");
const TrieSearch = require("trie-search");

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
const userHashByFullName = new Map();
// const userTrie = new TrieSearch("name",{min: 3});
const userTrie = new TrieSearch();

/*----------------------------------------------------------------
initiates 
/*----------------------------------------------------------------*/
// TODO: go over all the description of the functions
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
      addUserToTrie(user);
      addUserToFullName(user);
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
  userTrie.map(user.name, user.id);
};
/**
 * @function addUserToFullName
 * add user to addUserToFullName hash
 */
const addUserToFullName = (user) => {
  const name = user.name.replace(" ", "").toLowerCase();
  // check if fullName already exists and add user to userHashByFullName
  if (userHashByFullName.get(name)) {
    const arrOfId = userHashByFullName.get(name);
    arrOfId.push(user.id);
    userHashByFullName.set(name, arrOfId);
  } else userHashByFullName.set(name, [user.id]);
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
    ? returnUserFunction("country",country)
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
    ? returnUserFunction("year",year)
    : "Age dosen't exist";
};
/**
 * @function getUserByName
 * get user by name
 */
const getUserByName = (name) => {
  // check if it is a full name => call Hash of full name
  if (name.indexOf(" ") >= 0) {
    fullName = name.replace(" ", "").toLowerCase();
    return userHashByFullName.get(fullName)
      ? returnUserFunction("fullName", fullName)
      : "user dosen't exist";
  }
  // not a full name => call trie
  return returnUserFunction("name", name);
};
/**
 * @function returnUserFunction
 * get id array and return user obj
 */
const returnUserFunction = (op, val) => {
  const returnArr = [];
  let arrOfId;
  switch (op) {
    case "name": {
      arrOfId = userTrie.search(val).splice(0);
      break;
    }
    case "fullName": {
      const fullName = val.replace(" ", "").toLowerCase();
      arrOfId = userHashByFullName.get(fullName);
      break;
    }
    case "year": {
      arrOfId = userHashByYear.get(val);
      break;
    }
    case "country": {
      arrOfId = userHashByCountry.get(val);
      break;
    }
  }
  return arrOfId
    ? arrOfId.map((id) => {
        if (userHashByID.get(id)) return userHashByID.get(id);
      })
    : "no user found";
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
    deleteUserFromHashFullName(user.name, id);
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
  const index = arrOfId.indexOf(id);
  if (index > -1) arrOfId.splice(index, 1);
  arrOfId.length === 0
    ? userHashByCountry.delete(country)
    : userHashByCountry.set(country, arrOfId);
};
/**
 * @function deleteUserFromHashAge
 * delete from userHashByAge
 */
const deleteUserFromHashAge = (dob, id) => {
  const userYear = getUserYear(dob);
  const arrOfId = userHashByYear.get(userYear);
  const index = arrOfId.indexOf(id);
  if (index > -1) arrOfId.splice(index, 1);
  arrOfId.length === 0
    ? userHashByYear.delete(userYear)
    : userHashByYear.set(userYear, arrOfId);
};
/**
 * @function deleteUserFromHashFullName
 * delete from userHashByFullName
 */
const deleteUserFromHashFullName = (name, id) => {
  fullName = name.replace(" ", "").toLowerCase();
  const arrOfId = userHashByFullName.get(fullName);
  console.log(arrOfId);
  const index = arrOfId.indexOf(id);
  if (index > -1) arrOfId.splice(index, 1);
  arrOfId.length === 0
    ? userHashByFullName.delete(fullName)
    : userHashByFullName.set(fullName, arrOfId);
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
  getUserByName,
};
