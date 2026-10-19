import { Request, Response } from 'express';
import app from '../src/app';

const handler = (req: Request, res: Response) => {
  return app(req, res);
};

export default handler;

// Ensure full compatibility with @vercel/node module resolution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
