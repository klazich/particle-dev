// promise composition helper
const applyAsync = (acc, val) => acc.then(val);
const composeAsync = (...funcs) => x =>
  funcs.reduce(applyAsync, Promise.resolve(x));
