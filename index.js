var fs = require('fs');
const all = require('./all');
const dups = require('./dups');
const Scraper = require('images-scraper');
const sequential = require('promise-sequential');


const google = new Scraper.Google();
let count = 1;
const total = dups.length;
const gisFirst = (word) => () => google
  .list({
    keyword: word,
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
    console.log(`fetched ${count++}/${total} ...`);
    return r;
  });

const main = () => {
  const searches = dups
    .map((id) => `${id} - ${all[id]} panini fifa 2018`)
    .map(word => gisFirst(word));

  return sequential(searches)
    .then(r => {
      fs.writeFile("./players.json", JSON.stringify(r), function(err) {
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