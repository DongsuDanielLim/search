import { Controller, Get, Query } from '@nestjs/common';
import { Search } from 'src/interfaces/search.interface';
import { SearchService } from './search.service';
import { maxHeaderSize } from 'http';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}
  
  @Get()
  async search(@Query() queryParams?: {q: string, page: number, size: number}) {
    // return this.searchService.search(query)
    return this.searchService.searchAll(queryParams.q, {limit: queryParams.size, page: queryParams.page})
  }

  // @Get('all')
  // async searchAll(@Query('q') query?: string) {
  //   return this.searchService.searchAll(query)
  // }
}
