const record = artifacts.require("record");

module.exports = function(deployer) {
  deployer.deploy(record);
};
