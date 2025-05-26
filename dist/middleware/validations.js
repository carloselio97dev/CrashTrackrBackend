"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInputsErrors = void 0;
const express_validator_1 = require("express-validator");
const handleInputsErrors = (req, res, next) => {
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.handleInputsErrors = handleInputsErrors;
//# sourceMappingURL=validations.js.map