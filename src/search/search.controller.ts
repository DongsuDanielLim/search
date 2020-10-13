import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}
  
  @Get()
  async search(@Query() queryParams?: {q: string, page: number, size: number}) {
    const result = await this.searchService.searchAll(queryParams.q, {limit: queryParams.size, page: queryParams.page})
    return result
  }

  // @Get('all')
  // async searchAll(@Query('q') query?: string) {
  //   return this.searchService.searchAll(query)
  // }
}
