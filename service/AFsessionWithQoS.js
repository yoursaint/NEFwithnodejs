const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

// data schema
let asSessionWithQoSSubscriptionSchema = require('./JSONschema/AsSessionWithQoSSubscription.json');
let asSessionWithQoSSubscriptionPatchSchema = require('./JSONschema/AsSessionWithQoSSubscriptionPatch.json');

router.use(express.json({ type: 'application/merge-patch+json' }));

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
 * 3gpp-as-session-with-qos
 * TS 29.122
 */

/**
 * subscription (Collection)
 * af의 session with qos subscriptions 저장 및 조회
 * METHOD : GET, POST
 * uri : /{afId}/subscriptions
 * GET : 대상 af의 subscriptions 조회
 * POST : 
 *  input json의 스키마 검사 (by ajv),
 *  nef의 메모리에 subscription 저장, subscriptionID 생성
 *  http header를 통한 subscription id 고지
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Not Found(404): 메모리에서 subscription을 찾을 수 없는 경우
 * Internal Server Error(500): 메모리에 subscription이 저장되지 않는 경우
 */

router.get('/:afId/subscriptions', (req, res, next) => {
    let subscription = subscriptions[req.params.afId];

    if (subscription == undefined) {
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

router.post('/:afId/subscriptions', (req, res, next) => {
    let isValid = ajv.validate(asSessionWithQoSSubscriptionSchema, req.body);

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
 * af의 subscription document 수정, 삭제 및 조회
 * METHOD : GET, PUT, PATCH, DELETE
 * uri : /{afId}/subscription/{subscriptionId}
 * - 구현
 * GET : 해당 subscriptionId를 가지는 subscription 조회
 * PUT : 
 *  input json의 스키마 검사 (by ajv),
 *  subscription 교체
 * PATCH : 
 *  input json의 스키마 검사 (by ajv),
 *  subscription 수정
 * DELETE : 대상 subscription 삭제
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Internal Server Error(204): 메모리의 subscription이 삭제되어 'no content' 상태
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Not Found(404): 메모리에서 subscription을 찾을 수 없는 경우
 * Internal Server Error(500): 메모리에 subscription이 저장되지 않는 경우
 */

router.get('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    let subscription = subscriptions[req.params.afId][req.params.subscriptionId];

    if (subscription == undefined) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "afId is not found in subscriptions";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "afId is not found in subscriptions";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.json(subscription);
    }
});

router.put('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    let isValid = ajv.validate(asSessionWithQoSSubscriptionSchema, req.body);

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
    let isValid = ajv.validate(asSessionWithQoSSubscriptionPatchSchema, req.body);

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

            for (let i = 0; i < keys.length; i++) {
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

router.delete('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    try {
        subscriptions[req.params.afId].splice(req.params.subscriptionId, 1, null);
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