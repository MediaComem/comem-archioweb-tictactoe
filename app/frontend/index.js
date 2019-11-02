import './sass/main.scss';

// Include Bootstrap's JavaScript components.
import 'bootstrap/dist/js/bootstrap';

import $ from 'jquery';

import ViewManager from './view-manager';
import { createFrontendDispatcher } from './dispatcher';

$(() => createFrontendDispatcher(new ViewManager()));
