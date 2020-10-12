import { Injectable, Get, Module } from '@nestjs/common';
import * as _ from 'lodash'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { ConfigService } from '../config/config.service'
import { QueryService } from '../query/query.service';

@Injectable()
export class SearchService {
  private nomalizer = {
    hotel: function (list) {
      !list || list.length < 1 ? [] : list.map((v: any, k: string ) => {
        return {
          doc_id: v._id,
          category: 'H',
          hotel_name_full: [v._source.hotel_name, v._source.hotel_city].join(' '),
          highlight_hotel_name: v.highlight && v.highlight.hotel_name ? v.highlight.hotel_name : null,
          highlight_hotel_city: v.highlight && v.highlight.hotel_city ? v.highlight.hotel_city : null
        }
      })
    },
    region: function (type, list) {
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
          category: CONST.SEARCH_CATEGORY[currentType[0].toUpperCase()] || CONST.SEARCH_CATEGORY.REGION,
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
  
  
  async searchAll(search: string, {limit, page}) {
    const {results: hotelResult, total: hotelTotal} = await this.searchHotel(search, {limit, page})
    const {results: cityResult, total: cityTotal} = await this.searchCity(search, {limit, page})
    const {results: stationResult, total: stationTotal} = await this.searchStation(search, {limit, page})
    const {results: poiResult, total: poiTotal} = await this.searchPOI(search, {limit, page})
    const {results: airportResult, total: airportTotal} = await this.searchAirport(search, {limit, page})
    return test
    // const {query: hotelQuery, highlight: hotelHighlight} = this.queryService.get('hotel', search)
    // const {query: cityQuery, highlight: cityHighlight} = this.queryService.get('city', search)
  }

  async searchHotel(search: string, {limit, page}) {
    const {query: hotelQuery, highlight: hotelHighlight} = this.queryService.get('hotel', search, limit, page)

    const {body} = await this.esService.search({
      index: this.configService.get('ELASTICSEARCH_INDEX'),
      size: 10,
      body: {
        query: hotelQuery,
        highlight: hotelHighlight
      }
    })

    const hits = body.hits.hits
    const results = hits.map(item => {
      return item._source
    })
    return {total: body.hits.total.value, results}
  }

  async searchCity(search: string, {limit, page}) {
    const {query: cityQuery, highlight: cityHighlight} = this.queryService.get('city', search, limit, page)

    const {body} = await this.esService.search({
      index: this.configService.get('ELASTICSEARCH_INDEX'),
      size: 10,
      body: {
        query: cityQuery,
        highlight: cityHighlight
      }
    })

    const hits = body.hits.hits
    const results = hits.map(item => {
      return item._source
    })
    return {total: body.hits.total.value, results}
  }

  async searchStation(search: string, {limit, page}) {
    const {query: hotelQuery, highlight: hotelHighlight} = this.queryService.get('hotel', search, limit, page)

    const {body} = await this.esService.search({
      index: this.configService.get('ELASTICSEARCH_INDEX'),
      size: 10,
      body: {
        query: hotelQuery,
        highlight: hotelHighlight
      }
    })

    const hits = body.hits.hits
    const results = hits.map(item => {
      return item._source
    })
    return {total: body.hits.total.value, results}
  }

  async searchPOI(search: string, {limit, page}) {
    const {query: hotelQuery, highlight: hotelHighlight} = this.queryService.get('hotel', search, limit, page)

    const {body} = await this.esService.search({
      index: this.configService.get('ELASTICSEARCH_INDEX'),
      size: 10,
      body: {
        query: hotelQuery,
        highlight: hotelHighlight
      }
    })

    const hits = body.hits.hits
    const results = hits.map(item => {
      return item._source
    })
    return {total: body.hits.total.value, results}
  }

  async searchAirport(search: string, {limit, page}) {
    const {query: hotelQuery, highlight: hotelHighlight} = this.queryService.get('hotel', search, limit, page)

    const {body} = await this.esService.search({
      index: this.configService.get('ELASTICSEARCH_INDEX'),
      size: 10,
      body: {
        query: hotelQuery,
        highlight: hotelHighlight
      }
    })

    const hits = body.hits.hits
    const results = hits.map(item => {
      return item._source
    })
    return {total: body.hits.total.value, results}
  }
}
