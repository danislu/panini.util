var fs = require('fs');
const all = require('./all');
const dups = require('./dups');
const missing = require('./missing');
const Scraper = require('images-scraper');
const sequential = require('promise-sequential');


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

const main = () => {
  const dupPromises = getPromiseArray(dups);
  const missingPromises = getPromiseArray(missing);

  return sequential(dupPromises)
    .then(duplicates => sequential(missingPromises)
      .then(missing => ({
        duplicates,
        missing, 
      }))
    )
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