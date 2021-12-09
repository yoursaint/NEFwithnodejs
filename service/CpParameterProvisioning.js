const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

const cpInfo = require('./JSONschema/CpInfo.json');
const cpParameterSet = require('./JSONschema/CpParameterSet.json');

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
 * 3gpp-cp-parameter-provisioning
 * TS 29.122
 */

/**
 * af의 subscriptions collection 저장 및 조회
 * METHOD : GET, POST
 * uri : /{afId}/subscription
 * - 구현
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

router.post('/:afId/subscriptions', (req, res, next) => {
    let isValid = ajv.validate(cpInfo, req.body);

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
 * METHOD : GET, PUT, DELETE
 * uri : /{afId}/subscription/{subscriptionId}
 * - 구현
 * GET : 해당 subscriptionId를 가지는 subscription 조회
 * PUT : 
 *  input json의 스키마 검사 (by ajv),
 *  nef의 메모리에 새로운 subscription을 저장하여 수정
 * DELETE : 대상 subscirption 삭제
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
        res.json(subscription);
    }
});

router.put('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    let isValid = ajv.validate(cpInfo, req.body);

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

router.delete('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    try {
        subscriptions[req.params.afId].splice(req.params.subscriptionId, 1);
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

/**
 * subscription document의 cpSets 수정, 삭제 및 조회
 * METHOD : GET, PUT, DELETE
 * uri : /{afId}/subscription/{subscriptionId}/cpSets/{setId}
 * - 구현
 * GET : 해당 setId를 가지는 cpSets 조회
 * PUT :
 *  input json의 스키마 검사 (by ajv),
 *  해당 setId를 가지는 cpSet 수정
 *  nef의 메모리에 새로운 cpsets을 저장하여 수정
 * DELETE : 대상 cpSet 삭제
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Internal Server Error(204): 메모리의 subscription이 삭제되어 'no content' 상태
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Not Found(404): 메모리에서 subscription을 찾을 수 없는 경우
 * Internal Server Error(500): 메모리에 subscription이 저장되지 않는 경우
 */

router.get('/:afId/subscriptions/:subscriptionId/cpSets/:setId', (req, res, next) => {
    let subscription = subscriptions[req.params.afId][req.params.subscriptionId]['cpParameterSets'];

    let consist = findSetIdKey(subscription, req.params.setId);

    if (typeof subscription == 'undefined' || consist == null) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "setId is not found in subscription";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "setId is not found in subscription";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.statusCode = 200;
        res.json(subscription[consist]);
    }
});

router.put('/:afId/subscriptions/:subscriptionId/cpSets/:setId', (req, res, next) => {
    let isValid = ajv.validate(cpParameterSet, req.body);
    let subscription = subscriptions[req.params.afId][req.params.subscriptionId]['cpParameterSets'];

    let consist = findSetIdKey(subscription, req.params.setId);

    if (typeof subscription == 'undefined' || consist == null) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "setId is not found in subscription";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "setId is not found in subscription";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else if (!isValid) {
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
            subscription[consist] = req.body;
            res.statusCode = 200;
            res.json(subscription[consist]);
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

router.delete('/:afId/subscriptions/:subscriptionId/cpSets/:setId', (req, res, next) => {
    try {
        let subscription = subscriptions[req.params.afId][req.params.subscriptionId]['cpParameterSets'];

        let consist = findSetIdKey(subscription, req.params.setId);

        if (typeof subscription == 'undefined' || consist == null) {
            let problemDetailsSub = problemDetails;

            problemDetailsSub.type = "Not Found";
            problemDetailsSub.title = "setId is not found in subscription";
            problemDetailsSub.status = 404;
            problemDetailsSub.detail = "setId is not found in subscription";

            res.setHeader('Content-type', 'application/problem+json');
            res.statusCode = 404;
            res.json(problemDetailsSub);
        } else {
            delete subscription[consist];
            res.statusCode = 204;
            res.json({});
        }
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

/**
 * setId에 해당하는 key를 찾아 반환
 */

function findSetIdKey(obj, setId) {
    let key = null;

    for (let prop in obj) {
        console.log(prop + ' ' + obj[prop]);
        
        if (obj[prop]['setId'] == setId) key = prop;
    }

    return key;
}

module.exports = router;