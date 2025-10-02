import { Request, Response, Router } from 'express';
import getFeedbackService from '../services/getFeedbackService';
import { FeedbackOrigin } from '../types/feedback';

const feedbackRouter = Router();
const feedbackService = getFeedbackService();

feedbackRouter.post('/report', async (req: Request, res: Response) => {
  const { headers } = req;
  const { title, name, issue, attachment } = req.body;

  try {
    let origin: FeedbackOrigin = 'web';
    const useragent = headers['User-Agent'] || headers['user-agent'];

    if (useragent != null) {
      if (useragent.includes('VeraNativeiOS')) {
        origin = 'iOS';
      } else if (useragent.includes('VeraNativeAndroid')) {
        origin = 'Android';
      }
    }

    const feedbackData = await feedbackService.reportIssue({
      title,
      name,
      issue,
      attachment,
      origin,
    });
    if (feedbackData) {
      return res.status(200).json({ feedbackData });
    }
    return res.status(500).json({ message: 'Failed to create a report ticket' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : error;
    return res.status(500).json({ message: `Error reporting issue: ${message}` });
  }
});

export default feedbackRouter;
