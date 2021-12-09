const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

const trafficInfluSubSchema = require('./JSONschema/TrafficInfluSub');
const trafficInfluSubPatchSchema = require('./JSONschema/TrafficInfluSubPatch');

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

let subscriptions = [[],];

/**
 * Traffic Influence Subscription
 * TS 29.522
 * V 15.9.0
 */

/**
 * get request에 따라 저장된 subscriptions 정보를 제공
 * -구현
 * 저장된 subscription 제공
 * - 에러 처리
 * Not Found(404): 메모리에서 subscription을 찾을 수 없는 경우
 */

router.get('/:afId/subscriptions', (req, res, next) => {
    let subscription = subscriptions[req.params.afId];

    if (typeof subscription == 'undefined') {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "afId is not found in subscriptions";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "afId is not found in subscriptions";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.statusCode = 200;
        res.json(subscription);
    }
});

/**
 * post request에 따라 subscription 정보를 nef에 저장
 * -구현
 * input json의 스키마 검사 (by ajv)
 * nef의 메모리에 subscription 저장
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Internal Server Error(500): 메모리에 subscription이 저장되지 않는 경우
 */

router.post('/:afId/subscriptions', (req, res, next) => {
    let isValid = ajv.validate(trafficInfluSubSchema, req.body);

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
            let length = 0;

            if (typeof subscriptions[req.params.afId] == 'undefined') {
                subscriptions[req.params.afId] = [req.body];
            } else {
                length = subscriptions[req.params.afId].push(req.body) - 1;
            }
            res.statusCode = 201;
            // header에 location으로 uri를 전달하여 af가 subscription의 위치를 알 수 있도록 함
            res.setHeader('Location', `/${req.params.afId}/subscriptions/${length}`)
            res.json(subscriptions[req.params.afId][length]);
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
 * Individual Traffic Influence Subscription
 * TS 29.522
 * V 15.9.0
 */

/**
 * get request에 따라 저장된 subscription 정보를 제공
 * -구현
 * 저장된 subscription 제공
 * - 에러 처리
 * Not Found(404): 메모리에서 subscription을 찾을 수 없는 경우
 */
router.get('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    let subscription = subscriptions[req.params.afId][req.params.subscriptionId];

    if (typeof subscription == 'undefined') {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "afId is not found in subscriptions";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "afId is not found in subscriptions";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.statusCode = 200;
        res.json(subscription);
    }
});

/**
 * put과 patch request에 따라 subscription 정보를 수정
 * -구현
 * input json의 스키마 검사 (by ajv)
 * nef 메모리의 subscription 수정
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Internal Server Error(500): 메모리에 subscription이 저장되지 않는 경우
 */


router.put('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    let isValid = ajv.validate(trafficInfluSubSchema, req.body);

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
            subscriptions[req.params.afId][req.params.subscriptionId] = req.body;
            res.statusCode = 200;
            res.json(subscriptions[req.params.afId][req.params.subscriptionId]);
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

router.patch('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    let isValid = ajv.validate(trafficInfluSubPatchSchema, req.body);

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
            let keys = Object.keys(req.body);

            
            for (let i = 0; i < keys.length; i++){
                subscriptions[req.params.afId][req.params.subscriptionId][keys[i]] = req.body[keys[i]];
            }

            res.statusCode = 200;
            res.json(subscriptions[req.params.afId][req.params.subscriptionId]);
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
 * delete request에 따라 subscription 정보를 삭제
 * -구현
 * nef 메모리의 subscription 삭제
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Internal Server Error(204): 메모리의 subscription이 삭제되어 'no content' 상태
 */

router.delete('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    try {
        subscriptions[req.params.afId].splice(req.params.subscriptionId, 1);
        res.statusCode = 204;
        res.json({});
    } catch(error) {
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