import Particle from 'particle-api-js';

// promise composition helper
const applyAsync = (acc, val) => acc.then(val);
const composeAsync = (...funcs) => x =>
  funcs.reduce(applyAsync, Promise.resolve(x));

const particle = new Particle();

const loginOptions = {
  username: process.env.LOGIN,
  password: process.env.PASSWD,
};

// Particle Photon
// device id: 41002b000b51353335323535

// MCP23008_SCI07R1G5L2
// - https://store.ncd.io/product/iot-1-channel-spdt-relay-shield-7-gpio/
// - https://github.com/ncd-io/MCP2300

// SHT25
// - https://store.ncd.io/product/sht25-humidity-and-temperature-sensor-%C2%B11-8rh-%C2%B10-2c-i2c-mini-module/
// - https://github.com/ControlEverythingCommunity/SHT25

const particle
  .login(loginOptions)
  .then(data => {
    return data
  })
  .then(data => {
    console.log('API call completed, data:', data);
  })
  .catch(err => {
    console.log('API call failed with:', err);
  });

