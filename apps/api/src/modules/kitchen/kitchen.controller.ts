import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { KitchenService } from './kitchen.service';
import { UpdateKitchenQueueDto } from './dto/kitchen.dto';

@Controller('kitchen')
@UseGuards(AuthGuard('jwt'))
export class KitchenController {
  constructor(private kitchenService: KitchenService) {}

  @Get('queue')
  async getKitchenQueue(@Query('status') status?: string, @Request() req) {
    return this.kitchenService.getKitchenQueue(req.user.branchId, status as any);
  }

  @Get('queue/:id')
  async getQueueItem(@Param('id') id: string, @Request() req) {
    return this.kitchenService.getQueueItem(id, req.user.branchId);
  }

  @Patch('queue/:id/status')
  async updateQueueStatus(
    @Param('id') id: string,
    @Body() dto: UpdateKitchenQueueDto,
    @Request() req,
  ) {
    return this.kitchenService.updateQueueStatus(id, req.user.branchId, dto);
  }

  @Patch('queue/:id/priority')
  async setQueuePriority(
    @Param('id') id: string,
    @Body() body: { priority: number },
    @Request() req,
  ) {
    return this.kitchenService.setQueuePriority(id, req.user.branchId, body.priority);
  }
}
