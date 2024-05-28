const fs = require("fs/promises");
exports.fetchEndpoints = () => {
  return fs.readFile("./endpoints.json", "utf8").then((file) => {
    const parsedFile = JSON.parse(file);
    return parsedFile;
  });
};
