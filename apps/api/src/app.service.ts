import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      message: 'Villa del Sol RMS API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
