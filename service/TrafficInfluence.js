let express = require('express');
let router = express.Router();

/**
 * Traffic Influence Subscription
 * TS 29.522
 * V 15.9.0
 */

router.get('/:afId/subscriptions', (req, res, next) => {
    res.json(req.params.afId);
});

router.post('/:afId/subscriptions', (req, res, next) => {

});

/**
 * Individual Traffic Influence Subscription
 * TS 29.522
 * V 15.9.0
 */

router.get('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    res.json({afId: req.params.afId, subscriptionId: req.params.subscriptionId});
});

router.put('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    res.json({afId: req.params.afId, subscriptionId: req.params.subscriptionId});
});

router.patch('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    res.json({afId: req.params.afId, subscriptionId: req.params.subscriptionId});
});

router.delete('/:afId/subscriptions/:subscriptionId', (req, res, next) => {
    res.json({afId: req.params.afId, subscriptionId: req.params.subscriptionId});
});

module.exports = router;