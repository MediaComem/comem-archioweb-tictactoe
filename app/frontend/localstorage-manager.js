// Storing values in memory is sufficient for this demonstration.
const store = {};

module.exports = {
  save(key, data) {
    store[key] = JSON.stringify(data);
  },

  load(key) {
    return JSON.parse(store[key]);
  }
};
