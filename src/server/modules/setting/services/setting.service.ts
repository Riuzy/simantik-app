import { AppError } from '../../../middlewares/error-handler';
import { SettingRepository } from '../repositories/setting.repository';

export class SettingService {
  constructor(private repository: SettingRepository) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findByKey(key: string) {
    const setting = await this.repository.findByKey(key);
    if (!setting) throw new AppError(404, 'Setting not found');
    return setting;
  }

  async upsert(key: string, value: unknown) {
    return this.repository.upsert(key, value);
  }

  async delete(key: string) {
    await this.repository.delete(key);
  }
}
