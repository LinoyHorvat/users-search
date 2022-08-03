const fs = require("fs-extra");
const csv = require("csv-parser");
const TrieSearch = require("trie-search");

// TODO: To calculate the users real age!!!!
// TODO: What to do with wrong requests.
// TODO: Fix delete user with wrong id.

// TODO: Learn more about the use packages: csv-parser, createReadStream, pipe function
// TODO: delete all unnecessary dependencies from package.json
// TODO: go over all the description of the functions & spellings

/*----------------------------------------------------------------
constants 
/*----------------------------------------------------------------
// TODO: learn about the diff between obj and map in JS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
/*----------------------------------------------------------------
deceleration of constants 
/*----------------------------------------------------------------*/
const userHashByID = new Map();
const userHashByCountry = new Map();
const userHashByYear = new Map();
const userHashByFullName = new Map();
const userTrie = new TrieSearch();
userTrie.options.min = 3;
/*----------------------------------------------------------------
initiates 
/*----------------------------------------------------------------*/
/**
 * @function readDataFromCsvFileAndInitiate
 * reads the data from the CSV file and call the add functions.
 * The function doesn't check the validity of the user as it assumes that it has been given a valid CSV file.
 */
function readDataFromCsvFileAndInitiate() {
  fs.createReadStream("data.csv")
    .pipe(
      csv({
        mapHeaders: ({ header }) => header.toLowerCase(),
      })
    )
    .on("data", (user) => {
      addUserToId(user);
      addUserToCountry(user);
      addUserToYear(user);
      addUserToTrie(user);
      addUserToFullName(user);
    })
    .on("end", () => {
      console.log("Data loaded");
    });
}
/*----------------------------------------------------------------
Adding 
/*----------------------------------------------------------------*/

/**
 * @function addUserToId
 * add user id to userHashByID Hash table
 */
const addUserToId = (user) => {
  userHashByID.set(user.id, user);
};
/**
 * @function addUserToCountry
 * add user country to userHashByCountry Hash table
 */
const addUserToCountry = (user) => {
  const country = user.country.toLowerCase();
  // check if country already exists and add user id to country value array of id
  if (userHashByCountry.get(country)) {
    const arrOfId = userHashByCountry.get(country);
    arrOfId.push(user.id);
    userHashByCountry.set(country, arrOfId);
  } else userHashByCountry.set(country, [user.id]);
};
/**
 * @function addUserToYear
 * add user year of birth to userHashByYear Hash table.
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
 * add user to addUserToTrie trie-search
 */
const addUserToTrie = (user) => {
  userTrie.map(user.name, user.id);
};
/**
 * @function addUserToFullName
 * add user full name to addUserToFullName hash table
 */
const addUserToFullName = (user) => {
  const name = user.name.toLowerCase();
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
 * Get user by Id
 */
const getUserById = (id) => {
  id = id.toLowerCase();
  return userHashByID.get(id)
    ? userHashByID.get(id)
    : { err: "User not found" };
};
/**
 * @function getUsersByCountry
 * Get users by Country
 */
const getUsersByCountry = (country) => {
  country = country.toLowerCase();
  const arrOfId = userHashByCountry.get(country);
  return arrOfId ? returnUserObject(arrOfId) : { err: "Country not found" };
};
/**
 * @function getUsersByAge
 * Get users by age.
 * The function doesn't calculate the user exact age.
 * The age is calculated only from the user year of birth.
 */
const getUsersByAge = (age) => {
  const userYearOfBirth = new Date().getFullYear() - age;
  const arrOfId = userHashByYear.get(userYearOfBirth);
  return arrOfId ? returnUserObject(arrOfId) : { err: "Age not found" };
};
/**
 * @function getUsersByName
 * Get users by name
 */
const getUsersByName = (name) => {
  name = name.toLowerCase();
  // check if it is a full name => call Hash of full name
  if (name.indexOf(" ") >= 0) {
    fullName = name.toLowerCase();
    const arrOfId = userHashByFullName.get(fullName);
    return arrOfId ? returnUserObject(arrOfId) : { err: "User not found" };
  }
  // not a full name => check if its length is more then 3 => call trie
  else if (name.length >= 3) {
    const arrOfId = userTrie.search(name).splice(0);
    return arrOfId.length
      ? returnUserObject(arrOfId)
      : { err: "User not found" };
  } else return { err: "Partial match minimum 3 chars" };
};
/**
 * @function returnUserObject
 * Get array of id and return the full user obj
 * @param arrOfId - array of users id
 * @return user object.
 */
const returnUserObject = (arrOfId) => {
  return arrOfId && arrOfId.length
    ? arrOfId.map((id) => {
        return userHashByID.get(id);
      })
    : { err: "User not found" };
};

/*----------------------------------------------------------------
 delete
/*----------------------------------------------------------------*/
/**
 * @function deleteUser
 * Main function for deleting a user.
 * calling all relevant functions to delete the user.
 * and delete the user from userHashByID
 */
const deleteUser = (id) => {
  id = id.toLowerCase();
  // check if user exists and get its data:
  const user = getUserById(id);
  console.log("Print user before deleting", user);
  // user && !user.err
  if (user && user != "User doesn't exist") {
    deleteUserFromHashCountry(user.country, id);
    deleteUserFromHashAge(user.dob, id);
    deleteUserFromHashFullName(user.name, id);
    deleteUserFromHasTrie(user.name, id);
    userHashByID.delete(id);
    console.log("User was delete");
    return id;
  } else return "/nUser id doesn't exist";
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
  fullName = name.toLowerCase();
  const arrOfId = userHashByFullName.get(fullName);
  const index = arrOfId.indexOf(id);
  if (index > -1) arrOfId.splice(index, 1);
  arrOfId.length === 0
    ? userHashByFullName.delete(fullName)
    : userHashByFullName.set(fullName, arrOfId);
};
/**
 * @function deleteUserFromHasTrie
 * delete from userTrie
 */
const deleteUserFromHasTrie = (name, id) => {
  const [firstName, lastName] = name.split(" ");
  userTrie.delete(firstName, id);
  userTrie.delete(lastName, id);
};
/*----------------------------------------------------------------
Delete prototype
/*----------------------------------------------------------------*/
/**
 * @function getTheEndNode
 * get the last node of the key where the value is store, and called the delete function.
 * @param keyArr - array of chars e.g ['l','i','n','o','y']
 * @param value - The id of the stored name e.g "ce26edf2-39dd-56d0-87fa-21af60c2aae5"
 * @param node - the tree root
 */
const getTheEndNode = (keyArr, value, node) => {
  const root = node;
  while (keyArr.length != 0) {
    const k = keyArr.shift().toLowerCase();
    node = node[k];
  }
  deleteNodesEndValueFromTree(node, root, value);
};
/**
 * @function deleteNodesEndValueFromTree
 * delete the end node value from the tree
 * @param lastNode - the last node of the key where the value is stored
 * @param root - the tree root
 * @param id - the id of the key that need to be deleted
 */
const deleteNodesEndValueFromTree = (lastNode, root, id) => {
  // if there is more then one id for this name:
  if (lastNode.value.length > 1) {
    const arrOfId = lastNode.value;
    let index = arrOfId.indexOf(id);
    if (index > -1) {
      arrOfId.splice(index, 1);
    }
    // else if there is only one id stored
  } else if (lastNode.value[0] === id) {
    lastNode.value.pop();
    lastNode = "";
    root.size--;
  }
};
/**
 * @function TrieSearch.prototype.delete
 * Implementation of a delete last node value from the tree.
 * @param key - the user name
 * @param id - the user id
 */
TrieSearch.prototype.delete = (key, id) => {
  const keyArr = userTrie.keyToArr(key);
  getTheEndNode(keyArr, id, userTrie.root);
  userTrie.clearCache();
};
/*----------------------------------------------------------------
Delete prototype & utile
/*----------------------------------------------------------------*/
/**
 * @function getAge
 * calc user age from DOB.
 * @param dob - user date of birth
 * @return userYear - the year that the user was born.
 */
const getUserYear = (dob) => {
  const userYear = Number(dob.split("/")[2]);
  return userYear;
};

/*----------------------------------------------------------------
Export 
/*----------------------------------------------------------------*/

module.exports = {
  readDataFromCsvFileAndInitiate,
  getUserById,
  getUserByCountry: getUsersByCountry,
  getUserByAge: getUsersByAge,
  deleteUser,
  getUserByName: getUsersByName,
};
