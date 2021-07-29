const KeyRegistration = artifacts.require("./KeyRegistration.sol");

module.exports = function (deployer) {
  deployer.deploy(KeyRegistration);
};
