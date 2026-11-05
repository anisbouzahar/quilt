import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@quilt/contracts';
import { Public } from './auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  getHealth(): HealthResponse {
    return { status: 'ok', service: 'quilt-api' };
  }
}
