import { Request, Response, Router } from 'express';
import { z } from 'zod';
import getFeedbackService from '../services/getFeedbackService';
import { FeedbackOrigin, MAX_ATTACHMENT_BASE64_LENGTH } from '../types/feedback';

const feedbackRouter = Router();
const feedbackService = getFeedbackService();

const FeedbackReportSchema = z.object({
  title: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  issue: z.string().min(1).max(5000),
  attachment: z.string().max(MAX_ATTACHMENT_BASE64_LENGTH).optional().default(''),
});

const resolveOrigin = (userAgent: string | undefined): FeedbackOrigin => {
  if (userAgent?.includes('VeraNativeiOS')) return 'iOS';
  if (userAgent?.includes('VeraNativeAndroid')) return 'Android';
  return 'web';
};

feedbackRouter.post('/report', async (req: Request, res: Response) => {
  const parsed = FeedbackReportSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid feedback payload.' });
  }

  const { title, name, issue, attachment } = parsed.data;
  const origin = resolveOrigin(req.headers['user-agent']);

  try {
    const feedbackData = await feedbackService.reportIssue({
      title,
      name,
      issue,
      attachment,
      origin,
    });
    return res.status(200).json({ feedbackData });
  } catch (error: unknown) {
    // Log the full error server-side; return a generic message so internal
    // details (stack paths, upstream errors) are not exposed to the client.
    console.error('Error reporting issue:', error);
    return res.status(500).json({ message: 'Failed to report issue. Please try again later.' });
  }
});

export default feedbackRouter;
