var fs = require('fs');
const all = require('./all');
const dups = require('./dups');
const missing = require('./missing');
const Scraper = require('images-scraper');
const sequential = require('promise-sequential');
const flow = require('lodash/fp/flow');

const google = new Scraper.Google();
const gisFirst = (word, idx, total) => () => google
  .list({
    keyword: `${word} panini fifa 2018`,
    num: 1,
    detail: false,
    nightmare: {
      show: false
    }
  })
  .then(res => ({
    name: word,
    url: res[0].url,
  }))
  .then(r => {
    console.log(`fetched ${idx+1}/${total} ...`);
    return r;
  });

const getPromiseArray = ids => ids
  .map((id) => `${id} - ${all[id]}`)
  .map((word, idx) => gisFirst(word, idx, ids.length));

const getAllAsync = () => flow(
  all => Object.keys(all),
  getPromiseArray,
  sequential,
)(all);

const getSomeAsync = (ids) => flow(
  getPromiseArray,
  sequential,
)(ids);


const main = () => {
  let promise = Promise.resolve([]);

  const what = process.argv[2];
  switch(what){
    case 'dups':
      promise = getSomeAsync(dups);
      break;
    case 'missing':
      promise = getSomeAsync(missing);
      break;
    case 'all':
      promise = getAllAsync();
      break;
    default:
      throw new Error('No arg passed. Expected dups, missing or all');
  }

  return promise
    .then(players => {
      fs.writeFile("./players.json", JSON.stringify(players), function(err) {
        if(err) {
            return console.log(err);
        }
      
        console.log("The file was saved!");
      });
    });
};

console.log('running');
main()
  .then(() => console.log('finished successfully!'))