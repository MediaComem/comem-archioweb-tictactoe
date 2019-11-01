import './sass/main.scss';

const $ = require('jquery');
require('bootstrap/dist/js/bootstrap');

$(() => {
  require('./ws-frontend-dispatcher');
});
