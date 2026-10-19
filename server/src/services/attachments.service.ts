import { NotFoundError } from '../utils/errors';

export class AttachmentsService {
  static async getFileStream(_id: string): Promise<any> {
    throw new NotFoundError('Attachment functionality is disabled');
  }

  static async softDelete(_id: string, _actorId: string, _ip = ''): Promise<void> {
    throw new NotFoundError('Attachment functionality is disabled');
  }
}
