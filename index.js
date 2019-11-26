const request = require("request-promise");
const cheerio = require("cheerio");
const baseUrl = "https://pub.dev";
const json = [];
const homePage = async () => {
  const response = await request.get(baseUrl);
  const $ = cheerio.load(response);
  const packages = [];
  let i = 0;
  $(".package-list .title > a[href^='/packages/']").each((i, e) =>
    packages.push(baseUrl + $(e).attr("href"))
  );
  packages.forEach(url => {
    getFromPackagePage(url, obj => {
      i++;
      json.push(obj);
      if (i == packages.length) {
        console.log(json);
      }
    });
  });
};

const getFromPackagePage = (url, callback) => {
  request
    .get(url)
    .then(resp => {
      const $ = cheerio.load(resp);
      const title = $(".detail-header .title").text();
      const publisher =
        $(".detail-header .metadata > a[href^='/publishers/']").text() ||
        "No publisher found.";
      const about = $(".detail-info-box p")
        .eq(1)
        .text()
        .trim();
      const score = parseFloat($(".score-box .number").text());
      let dependencies = [];
      const dep = $(".detail-info-box p")
        .eq(4)
        .children("a");
      if (dep.length != 1) {
        dep.each((i, e) => dependencies.push($(e).text()));
      } else {
        dependencies = dep.attr("href");
      }

      return callback({
        title: title.split(" ")[0],
        publisher,
        about,
        url,
        score,
        dependencies,
        latest_version: title.split(" ")[1]
      });
    })
    .catch(err => console.error(err));
};
homePage();
