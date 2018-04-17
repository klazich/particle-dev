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

// photon mac address: 6c:0b:84:c8:65:20

// TODO:
// https://community.particle.io/t/photon-setup-flashing-cyan-with-a-quick-red-burst-now-orange-burst-solved/12118/23
// server: https://s3.amazonaws.com/spark-website/cloud_public.der
// pre-release: https://github.com/particle-iot/firmware/releases


console.log(loginOptions);

particle
  .login(loginOptions)
  .then(data => {
    console.log('API call completed, data:', data);
  })
  .catch(err => {
    console.log('API call failed with:', err);
  });
