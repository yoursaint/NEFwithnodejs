const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

// data schema


router.use(express.json({type : 'application/merge-patch+json'}));

const problemDetails = {
    "type": "string",
    "title": "string",
    "status": 0,
    "detail": "string",
    "instance": "string",
    "cause": "string",
    "invalidParams": [
        {
            "param": "string",
            "reason": "string"
        }
    ],
    "supportedFeatures": "string"
};

module.exports = router;