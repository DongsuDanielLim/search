import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchController } from './search/search.controller';
import { ConfigModule } from './config/config.module'
import { SearchModule } from './search/search.module';
import { QueryService } from './query/query.service';
import { QueryModule } from './query/query.module';

@Module({
  imports: [ConfigModule, QueryModule, SearchModule, QueryModule],
  controllers: [AppController, SearchController],
  providers: [AppService, QueryService]
})
export class AppModule {}
