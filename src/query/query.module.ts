import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: QueryService,
      useValue: new QueryService()
    }
  ],
  exports: [QueryService]
})
export class QueryModule {}
