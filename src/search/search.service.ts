import { Injectable, Get, Module } from '@nestjs/common';
import * as _ from 'lodash'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { ConfigService } from '../config/config.service'
import { QueryService } from '../query/query.service'

@Injectable()
export class SearchService {
  private normalizer = {
    hotel: function ({total = {value: 0}, hits: list = []}) {
      return !list || list.length < 1 ? [] : list.map((v: any) => {
        let each = v._source
        each.doc_id = v.hotel_id
        each.hotel_name_full = [v.hotel_name || '', v.hotel_city || ''].join(' ')
        each.highlight_hotel_name = v.highlight && v.highlight.hotel_name ? v.highlight.hotel_name : null
        each.highlight_hotel_city = v.highlight && v.highlight.hotel_city ? v.highlight.hotel_city : null
        return each
      })
    },
    region: function (type, {total = {value:0}, hits: list = []}) {
      const typeFieldsDic = {
        city: ['city', 'province_state', 'neighborhood'],
        poi: ['point_of_interest', 'high_level_region'],
        station: ['train_station', 'metro_station'],
        airport: ['airport']
      }

      const result = !list || list.length < 1 ? [] : list.reduce((accum, doc) => {
        let currentType = _.compact(typeFieldsDic[type].map((e) => { if (doc._source[e]) { return e } }))
        accum.push({
          ...doc._source,
          doc_id: doc._id.replace('R', ''),
          category: 'R',
          highlight_name_full: doc.highlight && doc.highlight.name_full ? doc.highlight.name_full : null
        })
        return accum
      }, [])
  
      return result
    }
  }

  constructor(private readonly esService: ElasticsearchService,
    private readonly configService: ConfigService,
    private readonly queryService: QueryService
    ) {}
  
  
  async searchAll(search: string, {limit = 10, page = 1}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')

    const hotelDsl =  this.queryService.get(index, 'hotel', search, limit, page)
    const cityDsl = this.queryService.get(index, 'city', search, limit, page)
    const stationDsl = this.queryService.get(index, 'station', search, limit, page)
    const poiDsl = this.queryService.get(index, 'poi', search, limit, page)
    const airportDsl = this.queryService.get(index, 'airport', search, limit, page)

    const [hotelResult, cityResult, stationResult, poiResult, airportResult] = await Promise.all([
      this.esService.search(hotelDsl),
      this.esService.search(cityDsl),
      this.esService.search(stationDsl),
      this.esService.search(poiDsl),
      this.esService.search(airportDsl)
    ])

    return {
      hotel: this.normalizer.hotel(hotelResult.body.hits),
      region: {
        city: this.normalizer.region('city', cityResult.body.hits),
        point_of_interest: this.normalizer.region('poi', poiResult.body.hits),
        metro_station: this.normalizer.region('station', stationResult.body.hits),
        airport: this.normalizer.region('airport', airportResult.body.hits)
      }
    }
  }

  async searchHotel(search: string, {limit, page}) {
    try {
      const index = this.configService.get('ELASTICSEARCH_INDEX')
      const hotelDsl = this.queryService.get(index, 'hotel', search, limit, page)
      const {body} = await this.esService.search(hotelDsl)
      return this.normalizer.hotel(body.gits)
    } catch (e) {
    }
  }

  async searchCity(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const cityDsl = this.queryService.get(index, 'city', search, limit, page)
    const {body} = await this.esService.search(cityDsl)
    return this.normalizer.region('city', body.gits)
  }

  async searchStation(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const stationDsl = this.queryService.get(index, 'station', search, limit, page)
    const {body} = await this.esService.search(stationDsl)
    return this.normalizer.region('station', body.gits)
  }

  async searchPOI(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const poiDsl = this.queryService.get(index, 'poi', search, limit, page)
    const {body} = await this.esService.search(poiDsl)
    return this.normalizer.region('poi', body.gits)
  }

  async searchAirport(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const airportDsl = this.queryService.get(index, 'airport', search, limit, page)
    const {body} = await this.esService.search(airportDsl)
    return this.normalizer.region('airport', body.gits)
  }

  async searchWithDistance(distance: string, lat: number, lon: number, {limit = 10, page = 1}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const distanceDsl = this.queryService.getDistance(index, distance, lat, lon, limit, page)
    const {body} = await this.esService.search(distanceDsl)
    return body.hits
  }
}
