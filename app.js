const express = require('express');
const createError = require('http-errors');
const { builtinModules } = require('module');
const path = require('path');
const logger = require('morgan');

let trafficInfluence = require('./service/TrafficInfluence');
let eventExposure = require('./service/EventExposure');
let cpParameterProvisioning = require('./service/CpParameterProvisioning');
let deviceTriggering = require('./service/DeviceTriggering');
let chargeableParty = require('./service/ChargeableParty');
let bdtpNegotiation = require('./service/BDTPNegotiation');
let pfdManagement = require('./service/PFDManagement');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/3gpp-traffic-Influence/v1', trafficInfluence);
app.use('/nnef-eventexposure/v1', eventExposure);
app.use('/3gpp-cp-parameter-provisioning/v1', cpParameterProvisioning);
app.use('/3gpp-device-triggering/v1', deviceTriggering);
app.use('/3gpp-chargeable-party/v1', chargeableParty);
app.use('/3gpp-bdt/v1', bdtpNegotiation);
app.use('/3gpp-pfd-management/v1', pfdManagement);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
/*
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
*/

module.exports = app;