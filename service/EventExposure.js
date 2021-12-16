const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

const nnefEventExposureSubscSchema = require('./JSONschema/NefEventExposureSubsc.json');

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

let subscriptions = [];

/**
 * NEF Event Exposure Service
 * TS 29.591
 */

/**
 * Subscription (Collection)
 * post request에 따라 subscriptions을 저장
 * -구현
 * input json의 스키마 검사 (by ajv)
 * nef의 메모리에 subscription 저장
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Internal Server Error(500): 메모리에 subscription이 저장되지 않는 경우
 */

router.post('/subscriptions', (req, res, next) => {
    let isValid = ajv.validate(nnefEventExposureSubscSchema, req.body);

    if (!isValid) {
        let errorMessages = ajv.errorsText();

        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Bad request";
        problemDetailsSub.title = "Invalid input error";
        problemDetailsSub.status = 400;
        problemDetailsSub.detail = errorMessages;

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 400;
        res.json(problemDetailsSub);
    } else {
        try {
            let length = subscriptions.length;

            if (typeof subscriptions[length] == 'undefined') {
                subscriptions[length] = req.body;
            } else {
                subscriptions[length].push(req.body);
            }
            res.statusCode = 201;
            // header에 location으로 uri를 전달하여 af가 subscription의 위치를 알 수 있도록 함
            res.setHeader('Location', `/subscriptions/${length}`)
            res.json(subscriptions[length]);
        } catch (error) {
            let problemDetailsSub = problemDetails;

            problemDetailsSub.type = "Internal Server Error";
            problemDetailsSub.title = "Internal Server Error";
            problemDetailsSub.status = 500;
            problemDetailsSub.detail = error;

            res.setHeader('Content-type', 'application/problem+json');
            res.statusCode = 500;
            res.json(problemDetailsSub);
        }
    }
});

/**
 * Individulal Subscription (Document)
 * 개별 subscription에 대한 get(Read), put(Update), delete(Delete)
 * -구현
 * get: 대상 subscription 조회
 * put: input json의 스키마 검사 (by ajv)
 * put: nef의 메모리에 subscription 저장
 * delete: 대상 subscription 삭제
 * -에러처리
 * Internal Server Error(204): 메모리의 subscription이 삭제되어 'no content' 상태
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Not Found(404): 메모리에서 subscription을 찾을 수 없는 경우
 * Internal Server Error(500): 메모리에 subscription이 저장되지 않는 경우
 */

router.get('/subscriptions/:subscriptionId', (req, res, next) => {
    let subscription = subscriptions[req.params.subscriptionId];

    if (subscription == undefined) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "subscriptionId is not found in subscriptions";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "subscriptionId is not found in subscriptions";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.statusCode = 200;
        res.json(subscription);
    }
});

router.put('/subscriptions/:subscriptionId', (req, res, next) => {
    let isValid = ajv.validate(nnefEventExposureSubscSchema, req.body);

    if (!isValid) {
        let errorMessages = ajv.errorsText();

        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Bad request";
        problemDetailsSub.title = "Invalid input error";
        problemDetailsSub.status = 400;
        problemDetailsSub.detail = errorMessages;

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 400;
        res.json(problemDetailsSub);
    } else {
        try {
            subscriptions[req.params.subscriptionId] = req.body;
            res.statusCode = 200;
            res.json(subscriptions[req.params.subscriptionId]);
        } catch (error) {
            let problemDetailsSub = problemDetails;

            problemDetailsSub.type = "Internal Server Error";
            problemDetailsSub.title = "Internal Server Error";
            problemDetailsSub.status = 500;
            problemDetailsSub.detail = error;

            res.setHeader('Content-type', 'application/problem+json');
            res.statusCode = 500;
            res.json(problemDetailsSub);
        }
    }
});

router.delete('/subscriptions/:subscriptionId', (req, res, next) => {
    try {
        subscriptions.splice(req.params.subscriptionId, 1, undefined);
        res.statusCode = 204;
        res.json({});
    } catch (error) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Internal Server Error";
        problemDetailsSub.title = "Internal Server Error";
        problemDetailsSub.status = 500;
        problemDetailsSub.detail = error;

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 500;
        res.json(problemDetailsSub);
    }
});


module.exports = router;