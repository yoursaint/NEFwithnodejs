const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

const nnefEventExposureSubscSchema = require('./JSONschema/TrafficInfluSub');