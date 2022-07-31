const fs = require("fs-extra");
const async = require("async");
const csv = require("csv-parser");
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
      addUserToId(user)
      addUserToCountry(user)
      addUserToYear(user)
    })
    .on("end", function () {
      console.log("Data loaded");
      // console.log(userHashByYear);
    });
}
/**
 * @function getAge
 * calc user age by DOB
 */
// TODO: really calculate the users age
 const getUserYear = (dob)=> {
  // const todayYear = new Date().getFullYear();
  const userYear = Number(dob.split("/")[2])
  return userYear
}

/*----------------------------------------------------------------
Adding 
/*----------------------------------------------------------------*/

/**
 * @function addUserToId
 * add user to Id to userHashByID Hash tabe
 */
const addUserToId = (user)=> {
  userHashByID.set(user.id, user)
}
/**
 * @function addUserToCountry
 * add user to userHashByCountry Hash tabe
 */
 const addUserToCountry = (user)=> {
  const country = user.country.toLowerCase();
  // check if country already exists and add user to userHashByCountry
  if (userHashByCountry.get(country)) {
    const arrOfId = userHashByCountry.get(country)
    arrOfId.push(user.id)
    userHashByCountry.set(country, arrOfId)
  }
  else userHashByCountry.set(country, [user.id])
}
/**
 * @function addUserToYear
 * add user to userHashByYear Hash tabe
 */
 const addUserToYear = (user)=> {
  const year = getUserYear(user.dob)
  if (userHashByYear.get(year)) {
    const arrOfId = userHashByYear.get(year)
    arrOfId.push(user.id)
    userHashByYear.set(year, arrOfId)
  }
  else userHashByYear.set(year,[user.id])
}



/*----------------------------------------------------------------
Export 
/*----------------------------------------------------------------*/

readDataFromCsvFileAndInitiate();
module.exports = {
  readDataFromCsvFileAndInitiate,
};
