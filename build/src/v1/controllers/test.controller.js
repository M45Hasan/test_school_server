"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEligibility = exports.getTestByStep = exports.getAllTests = exports.updateTest = exports.createTest = void 0;
const test_model_1 = require("../../model/test.model");
const customError_1 = require("../../error/customError");
const tryCatch_1 = require("../../utils/tryCatch");
const appStatus_1 = __importDefault(require("../../utils/appStatus"));
const test_zod_1 = require("../../schema/test.zod");
const user_model_1 = require("../../model/user.model");
const attem_model_1 = require("../../model/attem.model");
// Create Test (Admin)
exports.createTest = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const validation = test_zod_1.TestZodSchema.parse(req.body);
    if (!validation) {
        return next(new customError_1.BadRequestError("Invalid test data"));
    }
    const test = new test_model_1.Test(validation);
    await test.save();
    (0, appStatus_1.default)(201, "Test created successfully", req, res);
});
// Update (Admin )
exports.updateTest = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const validation = test_zod_1.TestZodSchema.parse(req.body);
    if (!validation) {
        return next(new customError_1.BadRequestError("Invalid test data"));
    }
    const test = await test_model_1.Test.findByIdAndUpdate(id, validation, {
        new: true,
    });
    if (!test) {
        return next(new customError_1.BadRequestError("Test not found"));
    }
    (0, appStatus_1.default)(200, test, req, res);
});
// Get Tests (Admin )
exports.getAllTests = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const option = {
        page: page,
        limit: limit,
        sort: { step: 1 },
    };
    const tests = await test_model_1.Test.paginate({}, option);
    const total = await test_model_1.Test.countDocuments();
    (0, appStatus_1.default)(200, tests, req, res);
});
// Get Step
exports.getTestByStep = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const step = parseInt(req.params.step);
    if (![1, 2, 3].includes(step)) {
        return next(new customError_1.BadRequestError("Invalid test step (must be 1, 2, or 3)"));
    }
    const test = await test_model_1.Test.findOne({ step, isActive: true });
    if (!test) {
        return next(new customError_1.BadRequestError(`No active test found for step ${step}`));
    }
    (0, appStatus_1.default)(200, test, req, res);
});
// Eligibility
exports.checkEligibility = (0, tryCatch_1.tryCatch)(async (req, res, next) => {
    const userId = req.user._id;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new customError_1.BadRequestError('User not found');
    let eligibleStep = 1;
    // Check if user passed Step 1 
    const step1Passed = await attem_model_1.TestAttempt.exists({
        user: userId,
        status: 'passed',
        test: await test_model_1.Test.findOne({ step: 1 }).select('_id')
    });
    // Check if user passed Step 2 
    const step2Passed = step1Passed && await attem_model_1.TestAttempt.exists({
        user: userId,
        status: 'passed',
        test: await test_model_1.Test.findOne({ step: 2 }).select('_id')
    });
    if (step2Passed)
        eligibleStep = 3;
    else if (step1Passed)
        eligibleStep = 2;
    // 3. Get available tests for the eligible step
    const availableTests = await test_model_1.Test.find({
        step: eligibleStep,
        isActive: true
    }).select('_id duration totalQuestions');
    // 4. Check if user has pending attempts
    const pendingAttempt = await attem_model_1.TestAttempt.findOne({
        user: userId,
        status: 'in-progress',
        test: { $in: availableTests.map(t => t._id) }
    });
    (0, appStatus_1.default)(200, {
        eligibleStep,
        availableTests,
        pendingAttemptId: pendingAttempt?._id
    }, req, res);
});
