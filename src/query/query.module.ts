import { Module } from '@nestjs/common';
import { QueryService } from './query.service';

@Module({
  providers: [
    {
      provide: QueryService,
      useValue: new QueryService()
    }
  ],
  exports: [QueryService]
})
export class QueryModule {}
