import { Request, Response, Router } from 'express';
import getFeedbackService from '../services/getFeedbackService';

const feedbackRouter = Router();
const feedbackService = getFeedbackService();

feedbackRouter.post('/report', async (req: Request, res: Response) => {
  const { title, name, issue, attachment } = req.body;

  try {
    const feedbackData = await feedbackService.reportIssue({ title, name, issue, attachment });
    if (feedbackData) {
      return res.status(200).json({ feedbackData });
    }
    return res.status(500).json({ message: 'Failed to create a report ticket' });
  } catch (_error) {
    return res.status(500).json({ message: 'Error reporting issue' });
  }
});

export default feedbackRouter;
