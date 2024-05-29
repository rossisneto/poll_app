const getServerIp = require('./getServerIp');

function generateLink(uniqueLink) {
  const serverIp = getServerIp();
  return `http://${serverIp}:3000/campaign/${uniqueLink}`;
}

module.exports = generateLink;
