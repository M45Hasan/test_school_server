import { Request, Response, NextFunction } from "express";
import { Test, TestDocument, TestStep } from "../../model/test.model";
import { BadRequestError } from "../../error/customError";
import { tryCatch } from "../../utils/tryCatch";
import appStatus from "../../utils/appStatus";
import { TestZodSchema } from "../../schema/test.zod";
import { User } from "../../model/user.model";
import { TestAttempt } from "../../model/attem.model";

// Create Test (Admin)
export const createTest = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = TestZodSchema.parse(req.body);
    if (!validation) {
      return next(new BadRequestError("Invalid test data"));
    }

    const test = new Test(validation);
    await test.save();

    appStatus(201, "Test created successfully", req, res);
  }
);
// Update (Admin )
export const updateTest = tryCatch(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const validation = TestZodSchema.parse(req.body);

    if (!validation) {
      return next(new BadRequestError("Invalid test data"));
    }

    const test = await Test.findByIdAndUpdate(id, validation, {
      new: true,
    });

    if (!test) {
      return next(new BadRequestError("Test not found"));
    }

    appStatus(200, test, req, res);
  }
);

// Get Tests (Admin )
export const getAllTests = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const option = {
      page: page,
      limit: limit,
      sort: { step: 1 },
    };

    const tests = await (Test as any).paginate({}, option);

    const total = await Test.countDocuments();

    appStatus(200, tests, req, res);
  }
);


// Get Step
export const getTestByStep = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const step = parseInt(req.params.step) as TestStep;

    if (![1, 2, 3].includes(step)) {
      return next(
        new BadRequestError("Invalid test step (must be 1, 2, or 3)")
      );
    }

    const test = await Test.findOne({ step, isActive: true });
    if (!test) {
      return next(new BadRequestError(`No active test found for step ${step}`));
    }

    appStatus(200, test, req, res);
  }
);

// Eligibility
export const checkEligibility = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    
    const user = await User.findById(userId);
    if (!user) throw new BadRequestError('User not found');

    
    let eligibleStep: 1 | 2 | 3 = 1;

    // Check if user passed Step 1 
    const step1Passed = await TestAttempt.exists({
      user: userId,
      status: 'passed',
      test: await Test.findOne({ step: 1 }).select('_id')
    });

    // Check if user passed Step 2 
    const step2Passed = step1Passed && await TestAttempt.exists({
      user: userId,
      status: 'passed', 
      test: await Test.findOne({ step: 2 }).select('_id')
    });

    if (step2Passed) eligibleStep = 3;
    else if (step1Passed) eligibleStep = 2;

    // 3. Get available tests for the eligible step
    const availableTests = await Test.find({ 
      step: eligibleStep,
      isActive: true
    }).select('_id duration totalQuestions');

    // 4. Check if user has pending attempts
    const pendingAttempt = await TestAttempt.findOne({
      user: userId,
      status: 'in-progress',
      test: { $in: availableTests.map(t => t._id) }
    });

    appStatus(200,{
      eligibleStep,
      availableTests,
      pendingAttemptId: pendingAttempt?._id
    }, req, res, );
  }
);