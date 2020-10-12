import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch'
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { QueryService } from 'src/query/query.service';

@Module({
  imports: [
      ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('ELASTICSEARCH_NODE'),
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
        sniffOnStart: true,
      }),
      inject: [ConfigService]
    }),
    ConfigModule,
  ],
  providers: [SearchService, QueryService],
  exports: [SearchService]
})
export class SearchModule {
  constructor(private searchService: SearchService){}
  // onModuleInit() {}
}
