"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', (req, res, next) => {
    // Optional auth for getEvents to show drafts for admin
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        return (0, auth_middleware_1.adminAuth)(req, res, next);
    }
    next();
}, event_controller_1.getEvents);
router.get('/:id', event_controller_1.getEventById);
router.post('/', auth_middleware_1.adminAuth, event_controller_1.createEvent);
router.put('/:id', auth_middleware_1.adminAuth, event_controller_1.updateEvent);
router.delete('/:id', auth_middleware_1.adminAuth, event_controller_1.deleteEvent);
exports.default = router;
