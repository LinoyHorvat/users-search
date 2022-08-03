const fs = require("fs-extra");
const csv = require("csv-parser");
const TrieSearch = require("trie-search");

// TODO: To calculate the users real age!!!!

// TODO: Learn more about the use packages: csv-parser, createReadStream, pipe function
// TODO: delete all unnecessary dependencies from package.json
// TODO: go over all the description of the functions & spellings
// TODO: learn about the diff between obj and map in JS: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
/*----------------------------------------------------------------
Deceleration of constants 
/*----------------------------------------------------------------*/
const userHashByID = new Map();
const userHashByCountry = new Map();
const userHashByYear = new Map();
const userHashByFullName = new Map();
const userTrie = new TrieSearch();
userTrie.options.min = 3;
/*----------------------------------------------------------------
Initiate Function
/*----------------------------------------------------------------*/
/**
 * @function readDataFromCsvFileAndInitiate
 * Reads the data from the CSV file and call the add functions.
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
Add Functions
/*----------------------------------------------------------------*/

/**
 * @function addUserToId
 * Add user id to userHashByID Hash table
 */
const addUserToId = (user) => {
  userHashByID.set(user.id, user);
};
/**
 * @function addUserToCountry
 * Add user country to userHashByCountry Hash table
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
 * Add user year of birth to userHashByYear Hash table.
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
 * Add user to addUserToTrie trie-search
 */
const addUserToTrie = (user) => {
  userTrie.map(user.name, user.id);
};
/**
 * @function addUserToFullName
 * Add user full name to addUserToFullName hash table
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
Get Functions
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
 * It should be noted that the age is calculated based on the year of birth only without taking into account the full DOB.
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
 Delete Functions
/*----------------------------------------------------------------*/
/**
 * @function deleteUser
 * Main function for deleting a user.
 * The function calls all relevant functions to delete the user from the memory.
 * At the end the function delete the user from userHashByID hash table.
 */
const deleteUser = (id) => {
  id = id.toLowerCase();
  // check if user exists and get its data:
  const user = getUserById(id);
  console.log("Print user before delete", user);
  if (user && !user.err) {
    deleteUserFromHashCountry(user.country, id);
    deleteUserFromHashAge(user.dob, id);
    deleteUserFromHashFullName(user.name, id);
    deleteUserFromHasTrie(user.name, id);
    userHashByID.delete(id);
    console.log("User deleted successfully");
  } else {
    console.log("Error User id not found");
    return {err: "User id not found"};
  }
};
/**
 * @function deleteUserFromHashCountry
 * Delete from userHashByCountry hash table.
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
 * Delete from userHashByAge hash table.
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
 * Delete from userHashByFullName hash table.
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
 * Delete from userTrie
 */
const deleteUserFromHasTrie = (name, id) => {
  const [firstName, lastName] = name.split(" ");
  userTrie.delete(firstName, id);
  userTrie.delete(lastName, id);
};
/*----------------------------------------------------------------
Delete trie-search Prototype & Functions
/*----------------------------------------------------------------*/
/**
 * @function TrieSearch.prototype.delete
 * Implementation of a delete last node value from the tree.
 * @param name - the user name
 * @param id - the user id
 */
 TrieSearch.prototype.delete = (name, id) => {
  const nameArray = userTrie.keyToArr(name);
  getTheEndNode(nameArray, id, userTrie.root);
  userTrie.clearCache();
};
/**
 * @function getTheEndNode
 * Get the last node (last char) of the name where the id is store. Then call the delete function.
 * @param nameArray - array of chars e.g ['l','i','n','o','y']
 * @param id - The id of the stored name
 * @param node - the tree root
 */
const getTheEndNode = (nameArray, id, node) => {
  const root = node;
  while (nameArray.length != 0) {
    const k = nameArray.shift().toLowerCase();
    node = node[k];
  }
  deleteNodesEndValueFromTree(node, root, id);
};
/**
 * @function deleteNodesEndValueFromTree
 * Delete the end node value (id) from the tree
 * @param lastNode - the last node of the name where the id is stored
 * @param root - the tree root
 * @param id - user id
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
/*----------------------------------------------------------------
Utile
/*----------------------------------------------------------------*/
/**
 * @function getUserYear
 * Get user year of birth from DOB.
 * @param dob - User date of birth
 * @return userYear - User year of birth.
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
