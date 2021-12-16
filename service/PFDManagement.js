const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

// data schema
const pfdDataSchema = require('./JSONschema/PfdData.json');
const pfdManagementSchema = require('./JSONschema/PfdManagement.json');

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

let transactions = [[],];

/**
 * 3gpp-pfd-management
 * TS 29.122
 */

/**
 * transaction (Collection)
 * af의 pfd management transaction 저장 및 조회
 * METHOD : GET, POST
 * uri : /{afId}/transactions
 * GET : 대상 af의 transactions 조회
 * POST : 
 *  input json의 스키마 검사 (by ajv),
 *  nef의 메모리에 transaction 저장, transactionID 생성
 *  http header를 통한 transaction id 고지
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Not Found(404): 메모리에서 transaction을 찾을 수 없는 경우
 * Internal Server Error(500): 메모리에 transaction이 저장되지 않는 경우
 */

 router.get('/:afId/transactions', (req, res, next) => {
    let transaction = transactions[req.params.afId];

    if (transaction == undefined) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "afId is not found in transactions";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "afId is not found in transactions";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.statusCode = 200;
        res.json(transaction);
    }
});

router.post('/:afId/transactions', (req, res, next) => {
    let isValid = ajv.validate(pfdManagementSchema, req.body);

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

            if (typeof transactions[req.params.afId] == 'undefined') {
                transactions[req.params.afId] = [req.body];
            } else {
                length = transactions[req.params.afId].push(req.body) - 1;
            }
            res.statusCode = 201;
            // header에 location으로 uri를 전달하여 af가 transaction의 위치를 알 수 있도록 함
            res.setHeader('Location', `/${req.params.afId}/transactions/${length}`)
            res.json(transactions[req.params.afId][length]);
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
 * af의 pfd management transaction document 수정, 삭제 및 조회
 * METHOD : GET, PUT, DELETE
 * uri : /{afId}/transactions/{transactionId}
 * - 구현
 * GET : 해당 transactionId를 가지는 transaction 조회
 * PUT : 
 *  input json의 스키마 검사 (by ajv),
 *  nef의 메모리에 새로운 transaction을 저장하여 수정
 * DELETE : 대상 transaction 삭제
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Internal Server Error(204): 메모리의 transaction이 삭제되어 'no content' 상태
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Not Found(404): 메모리에서 transaction을 찾을 수 없는 경우
 * Internal Server Error(500): 메모리에 transaction이 저장되지 않는 경우
 */

 router.get('/:afId/transactions/:transactionId', (req, res, next) => {
    let transaction = transactions[req.params.afId][req.params.transactionId];

    if (transaction == undefined) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "afId is not found in transactions";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "afId is not found in transactions";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.json(transaction);
    }
});

router.put('/:afId/transactions/:transactionId', (req, res, next) => {
    let isValid = ajv.validate(pfdManagementSchema, req.body);

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
            transactions[req.params.afId][req.params.transactionId] = req.body;
            res.statusCode = 200;
            res.json(transactions[req.params.afId][req.params.transactionId]);
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

router.delete('/:afId/transactions/:transactionId', (req, res, next) => {
    try {
        transactions[req.params.afId].splice(req.params.transactionId, 1, undefined);
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
 * transaction document의 applications 수정, 삭제 및 조회
 * METHOD : GET, PUT, PATCH, DELETE
 * uri : /{afId}/transactions/{transactionId}/applications/{appId}
 * - 구현
 * GET : 해당 appId를 가지는 applications 조회
 * PUT, PATCH :
 *  input json의 스키마 검사 (by ajv),
 *  해당 appId를 가지는 application 수정
 *  nef의 메모리에 새로운 applications을 저장하여 수정
 * DELETE : 대상 application 삭제
 * -미구현
 * 5G core와의 상호 작용
 * -에러처리
 * Internal Server Error(204): 메모리의 transaction이 삭제되어 'no content' 상태
 * Bad Request(400): request body json이 표준 schema와 상이한 경우
 * Not Found(404): 메모리에서 transaction을 찾을 수 없는 경우
 * Internal Server Error(500): 메모리에 transaction이 저장되지 않는 경우
 */

 router.get('/:afId/transactions/:transactionId/applications/:appId', (req, res, next) => {
    let transaction = transactions[req.params.afId][req.params.transactionId]['pfdDatas'];

    let consist = findappIdKey(transaction, req.params.appId);

    if (transaction == undefined || consist == null) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "appId is not found in transaction";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "appId is not found in transaction";

        res.setHeader('Content-type', 'application/problem+json');
        res.statusCode = 404;
        res.json(problemDetailsSub);
    } else {
        res.statusCode = 200;
        res.json(transaction[consist]);
    }
});

router.put('/:afId/transactions/:transactionId/applications/:appId', (req, res, next) => {
    let isValid = ajv.validate(pfdDataSchema, req.body);
    let transaction = transactions[req.params.afId][req.params.transactionId]['pfdDatas'];

    let consist = findappIdKey(transaction, req.params.appId);

    if (transaction == undefined || consist == null) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "appId is not found in transaction";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "appId is not found in transaction";

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
            transaction[consist] = req.body;
            res.statusCode = 200;
            res.json(transaction[consist]);
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

router.patch('/:afId/transactions/:transactionId/applications/:appId', (req, res, next) => {
    let isValid = ajv.validate(pfdDataSchema, req.body);
    let transaction = transactions[req.params.afId][req.params.transactionId]['pfdDatas'];

    let consist = findappIdKey(transaction, req.params.appId);

    if (transaction == undefined || consist == null) {
        let problemDetailsSub = problemDetails;

        problemDetailsSub.type = "Not Found";
        problemDetailsSub.title = "appId is not found in transaction";
        problemDetailsSub.status = 404;
        problemDetailsSub.detail = "appId is not found in transaction";

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
            transaction[consist] = req.body;
            res.statusCode = 200;
            res.json(transaction[consist]);
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

router.delete('/:afId/transactions/:transactionId/applications/:appId', (req, res, next) => {
    try {
        let transaction = transactions[req.params.afId][req.params.transactionId]['pfdDatas'];

        let consist = findappIdKey(transaction, req.params.appId);

        if (transaction == undefined || consist == null) {
            let problemDetailsSub = problemDetails;

            problemDetailsSub.type = "Not Found";
            problemDetailsSub.title = "appId is not found in transaction";
            problemDetailsSub.status = 404;
            problemDetailsSub.detail = "appId is not found in transaction";

            res.setHeader('Content-type', 'application/problem+json');
            res.statusCode = 404;
            res.json(problemDetailsSub);
        } else {
            delete transaction[consist];
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
 * appId에 해당하는 key를 찾아 반환
 */

function findappIdKey(obj, appId) {
    let key = null;

    for (let prop in obj) {
        if (obj[prop]['externalAppId'] == appId) key = prop;
    }

    return key;
}

module.exports = router;