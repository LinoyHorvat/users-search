const fs = require("fs-extra");
const async = require("async");
const csv = require('csv-parser')
// TODO: understand what csv-parser is & createReadStream & pipe


// TODO: understand diff between obj and map: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
/**
 * const
 */
const userHashByID = new Map();

// const getData = async ()=> {
//   const data = await fs.createReadStream("mockData.csv")
//   return data.toString().split("\r");
// }

// console.log(data.toString().split("\r"));

// TODO: rename this function
/**
 * @function readDataFromCsvFileAndInitiate
 * reads the data from the CSV file and initiates.
 */
function readDataFromCsvFileAndInitiate() {
  fs.createReadStream("mockData.csv")
    .pipe(csv())
    .on("data", function (row) {
      console.log(row);
    })
    .on("end", function () {
      console.log("Data loaded");
    });
}

readDataFromCsvFileAndInitiate();

module.exports = {
  readDataFromCsvFileAndInitiate,
};
