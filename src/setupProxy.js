module.exports = function (app) {
  app.get("/audiogata/plugin-frame.esm.js", (req, res, next) => {
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET",
    });
    next();
  });
};
