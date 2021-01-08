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

  // @Get('/distanc')
  // async searchAll(@Query() queryParams?: {lat: number, lon: number, distance: string, page: number, size: number}) {
  //   return this.searchService.searhcWithDistance(lat, lon, distance, {limit: queryParams.size, page: queryParams.page})
  // }
}
