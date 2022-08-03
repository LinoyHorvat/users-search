const fs = require("fs-extra");
const async = require("async");
const csv = require("csv-parser");
const TrieSearch = require("trie-search");

// TODO: Shouldn't i use async await????
// TODO: What to do with overflow? when there to many user with the same search. should i send them all back from the memory?
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
userTrie.options.min = 3
/*----------------------------------------------------------------
add del prototype 
/*----------------------------------------------------------------*/
TrieSearch.prototype.delete = function (key, id) {
  const keyArr = this.keyToArr(key),
    self = this;
  const nodeArr = [];
  deleteNode(keyArr, id, this.root, nodeArr, this.root);
  function deleteNode(keyArr, value, node, nodeArr, root) {
    while (keyArr.length != 0) {
      const k = keyArr.shift().toLowerCase();
      nodeArr.push(node[k]);
      node = node[k];
    }
    // deleteNodesFromTree(nodeArr,root,value)
    deleteNodesEndValueFromTree(node, root, value);
  }
  function deleteNodesFromTree(nodeArr, root, value) {
    const i = nodeArr.length - 1;
    if (Array.isArray(nodeArr[i].value)) {
      const arr = nodeArr[i].value;
      let index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      }
    } else if (nodeArr[i].value == value) {
      nodeArr[i].value.pop();
      nodeArr[i] = "";
      self.size--;
    }
  }
  function deleteNodesEndValueFromTree(lastNode, root, value) {
    if (lastNode.value.length > 1) {
      const arr = lastNode.value;
      let index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      }
    } else if (lastNode.value[0] === value) {
      lastNode.value.pop();
      lastNode = "";
      self.size--;
    }
  }
  this.clearCache();
  return id;
};
/*----------------------------------------------------------------
initiates 
/*----------------------------------------------------------------*/
/**
 * @function readDataFromCsvFileAndInitiate
 * reads the data from the CSV file and initiates.
 */
function readDataFromCsvFileAndInitiate() {
  fs.createReadStream("data.csv")
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
 * add user to Id to userHashByID Hash table
 */
const addUserToId = (user) => {
  userHashByID.set(user.id, user);
};
/**
 * @function addUserToCountry
 * add user to userHashByCountry Hash table
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
 * add user to userHashByYear Hash table
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
  return userHashByID.get(id) ? userHashByID.get(id) : "User doesn't exist";
};
/**
 * @function getUserByCountry
 * get user by Country
 */
const getUserByCountry = (country) => {
  country = country.toLowerCase();
  return userHashByCountry.get(country)
    ? returnUserFunction("country", country)
    : "Country doesn't exist";
};
/**
 * @function getUserByAge
 * get user by Age
 */
const getUserByAge = (age) => {
  const year = new Date().getFullYear() - age;
  return userHashByYear.get(year)
    ? returnUserFunction("year", year)
    : "Age doesn't exist";
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
      : "user doesn't exist";
  }
  // not a full name check if its length is more then 3 => call trie
  else if (name.length >= 3) return returnUserFunction("name", name);
  else return "Partial match minimum 3 chars"
};
/**
 * @function returnUserFunction
 * get id array and return user obj
 */
const returnUserFunction = (op, val) => {
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
  return arrOfId && arrOfId.length > 0
    ? arrOfId
        .filter((id) => {
          return userHashByID.get(id) !== undefined;
        })
        .map((id) => {
          return userHashByID.get(id);
        })
    : "no user found";
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
  console.log("Print user before deleting", user);
  if (user &&  user != "User doesn't exist") {
    deleteUserFromHashCountry(user.country, id);
    deleteUserFromHashAge(user.dob, id);
    deleteUserFromHashFullName(user.name, id);
    deleteUserFromHasTrie(user.name, id)
    userHashByID.delete(id);
    console.log("User was delete");
    return id
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
  fullName = name.replace(" ", "").toLowerCase();
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
