import express, { Router } from 'express';
import { StatusCode } from 'status-code-enum';
import { z } from 'zod';
import {
  ApplicationServerError,
  makeBadRequestErrorHandler,
  makeInternalErrorHandler,
} from '@api-lib/errors';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import getFeedbackService from '../services/getFeedbackService';
import loadConfig from '../helpers/config';
import type { FeedbackOrigin } from '../types/feedback';

const feedbackRouter = Router();
const feedbackService = getFeedbackService();
const { attachmentMaxBase64Length } = loadConfig();
const feedbackPayloadLimitInBytes = attachmentMaxBase64Length + 10_000;
const feedbackJsonParser = express.json({ limit: feedbackPayloadLimitInBytes });

const FeedbackReportSchema = z.object({
  title: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  issue: z.string().min(1).max(5000),
  attachment: z.string().max(attachmentMaxBase64Length).optional().default(''),
});

const normalizeUserAgent = (userAgentHeader: string | string[] | undefined): string => {
  if (Array.isArray(userAgentHeader)) return userAgentHeader.join(' ');
  return userAgentHeader ?? '';
};

const resolveOrigin = (userAgent: string): FeedbackOrigin => {
  if (userAgent.includes('VeraNativeiOS')) return 'iOS';
  if (userAgent.includes('VeraNativeAndroid')) return 'Android';
  return 'web';
};

const parseFeedbackPayload: RequestHandler = (request, response, next) => {
  feedbackJsonParser(request, response, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    const errorType = (error as { type?: string }).type;

    if (errorType === 'entity.too.large') {
      next(
        new ApplicationServerError({
          src: error,
          fallbackConfig: {
            fallbackMessage: 'Feedback payload too large',
            statusCode: StatusCode.ClientErrorPayloadTooLarge,
          },
        })
      );
      return;
    }

    next(makeBadRequestErrorHandler('Invalid feedback payload')(error));
  });
};

feedbackRouter.post(
  '/report',
  parseFeedbackPayload,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = FeedbackReportSchema.safeParse(req.body);

      if (!parsed.success) {
        return next(makeBadRequestErrorHandler('Invalid feedback payload')(parsed.error));
      }

      const { title, name, issue, attachment } = parsed.data;
      const userAgent = normalizeUserAgent(req.headers['user-agent']);
      const origin = resolveOrigin(userAgent);

      const feedbackData = await feedbackService.reportIssue({
        title,
        name,
        issue,
        attachment,
        origin,
      });

      return res.status(200).json({ feedbackData });
    } catch (error: unknown) {
      return next(makeInternalErrorHandler('Failed to report issue')(error));
    }
  }
);

export default feedbackRouter;
