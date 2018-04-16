import Particle from 'particle-api-js';

// promise composition helper
const applyAsync = (acc, val) => acc.then(val);
const composeAsync = (...funcs) => x =>
  funcs.reduce(applyAsync, Promise.resolve(x));

const particle = new Particle();

const loginOptions = {
  username: process.env.LOGIN,
  password: process.env.PASSWORD,
};

console.log(loginOptions);

particle
  .login(loginOptions)
  .then(data => {
    console.log('API call completed, data:', data);
  })
  .catch(err => {
    console.log('API call failed with:', err);
  });
