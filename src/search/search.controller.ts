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

  @Get('distance')
  async searchDistance(@Query() queryParams? :{distance: string, lat: number, lon: number, page: number, size: number}) {
    const result = await this.searchService.searchWithDistance(queryParams.distance, queryParams.lat, queryParams.lon, {limit: queryParams.size, page: queryParams.page})
    return result
  }

  @Get('intersections')
  async searchIntersections(@Query() queryParams? :{q: string, page: number, size: number}) {
    return 'intersections'
  }

  @Get('hotels')
  async searchhotels(@Query() queryParams? :{q: string, page: number, size: number}) {
    const result = await this.searchService.searchHotel(queryParams.q, {limit: queryParams.size, page: queryParams.page})
    return result
  }

  @Get('regions')
  async searchRegions(@Query() queryParams? :{q: string, page: number, size: number}) {
    return 'regions'
  }

  @Get('meta')
  async searchMeta(@Query() queryParams? :{q: string, page: number, size: number}) {
    return 'meta'
  }

  @Get('province')
  async searchProvince(@Query() queryParams? :{q: string, page: number, size: number}) {
    return 'province'
  }
}
