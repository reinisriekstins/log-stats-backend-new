const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/:logId', (req, res, next) => {
  console.log(req.ip)
  res.send(JSON.stringify({
    json: `http://logs.tf/json/${ req.params.logId }`,
    log: `http://logs.tf/${ req.params.logId }`
  }));
});

module.exports = router;
