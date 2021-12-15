const express = require('express');
const Ajv = require('ajv');

const router = express.Router();
const ajv = new Ajv();

const ChargeableParty = require('./JSONschema/ChargeableParty.json');
const ChargeablePartyPatch = require('./JSONschema/ChargeablePartyPatch.json');

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
 * af의 chargeable party 저장 및 조회
 * METHOD : GET, POST
 * uri : /{afId}/transactions
 * - 구현
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

    if (typeof transaction == 'undefined') {
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
    let isValid = ajv.validate(ChargeableParty, req.body);

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
 * af의 transaction document 수정, 삭제 및 조회
 * METHOD : GET, PATCH, DELETE
 * uri : /{afId}/transaction/{transactionId}
 * - 구현
 * GET : 해당 transactionId를 가지는 transaction 조회
 * PATCH : 
 *  input json의 스키마 검사 (by ajv),
 *  transaction 수정
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

    if (typeof transaction == 'undefined') {
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

router.patch('/:afId/transactions/:transactionId', (req, res, next) => {
    let isValid = ajv.validate(ChargeablePartyPatch, req.body);

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
                transactions[req.params.afId][req.params.transactionId][keys[i]] = req.body[keys[i]];
            }

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
        transactions[req.params.afId].splice(req.params.transactionId, 1);
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