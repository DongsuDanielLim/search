import { Injectable, Get, Module } from '@nestjs/common';
import * as _ from 'lodash'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { ConfigService } from '../config/config.service'
import { QueryService } from '../query/query.service'
import { SEARCH_CATEGORY } from '../consts.json'

@Injectable()
export class SearchService {
  private normalizer = {
    hotel: function ({total = {value: 0}, hits: list = []}) {
      return !list || list.length < 1 ? [] : list.map((v: any) => {
        let each = v._source
        each.doc_id = v._source.hotel_id + '',
        each.category = 'H',
        each.hotel_name_full = [v._source.hotel_name || '', v._source.hotel_city || ''].join(' ')
        each.highlight_hotel_name = v.highlight && v.highlight.hotel_name ? v.highlight.hotel_name : null
        each.highlight_hotel_city = v.highlight && v.highlight.hotel_city ? v.highlight.hotel_city : null
        each.highlight_hotel_name_full = _.compact(_.concat(each.highlight_hotel_name, each.highlight_hotel_city))
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
          category: SEARCH_CATEGORY[currentType[0].toUpperCase()] || SEARCH_CATEGORY.REGION,
          highlight_name_full: doc.highlight && doc.highlight.name_full ? doc.highlight.name_full : null
        })
        return accum
      }, [])
  
      return result
    },
    districtKRCities: function ({total = {value:0}, hits: list = []}) {
      const result = !list || list.length < 1 ? [] : list.reduce((accum, doc) => {
        const [lon, lat] = doc._source.geo_location.coordinates
        accum.push({
          region_geo_location: {
            lon,
            lat
          },
          id: doc._source.id,
          doc_id: doc._source.id,
          category: 'R',
          city: doc._source.name,
          name_full: doc._source.name_full,
          highlight_name_full: doc.highlight && doc.highlight.name_full ? doc.highlight.name_full : null
        })
        return accum
      }, [])
      return result
    },
    districtKRProvince: function ({total = {value:0}, hits: list = []}) {
      const result = !list || list.length < 1 ? [] : list.reduce((accum, doc) => {
        const {lon, lat} = doc._source.geo_location
        accum.push({
          region_geo_location: {
            lon: lon,
            lat: lat
          },
          id: doc.id,
          doc_id: doc.id,
          category: 'R',
          province: doc._source.name,
          name_full: doc.name_full,
          highlight_name_full: doc.highlight && doc.highlight.name_full ? doc.highlight.name_full : null
        })
        return accum
      }, [])
      return result
    },
    searchModel: function (list) {
      return list
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

    const [hotelResult, cityResult, stationResult, poiResult, airportResult, districtKRResult] = await Promise.all([
      this.esService.search(hotelDsl),
      this.esService.search(cityDsl),
      this.esService.search(stationDsl),
      this.esService.search(poiDsl),
      this.esService.search(airportDsl),
      this.searchCitiesProvinceKR(search, {limit, page})
    ])

    const {cities: districtKRCities, province: districtProvinceKR} = districtKRResult
    const districtKR = _.concat(districtProvinceKR, districtKRCities)

    return {
      hotel: this.normalizer.hotel(hotelResult.body.hits),
      region: {
        city: _.concat(districtKR, this.normalizer.region('city', cityResult.body.hits)),
        point_of_interest: this.normalizer.region('poi', poiResult.body.hits),
        metro_station: this.normalizer.region('station', stationResult.body.hits),
        airport: this.normalizer.region('airport', airportResult.body.hits)
      }
    }
  }

  async searchHotel(search: string, {limit = 10, page = 1}) {
    try {
      const index = this.configService.get('ELASTICSEARCH_INDEX')
      const hotelDsl = this.queryService.get(index, 'hotel', search, limit, page)
      const {body} = await this.esService.search(hotelDsl)

      return this.normalizer.searchModel(body.hits)
    } catch (e) {
      throw e
    }
  }

  async searchCity(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const cityDsl = this.queryService.get(index, 'city', search, limit, page)
    const {body} = await this.esService.search(cityDsl)

    return this.normalizer.region('city', body.hits)
  }

  async searchStation(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const stationDsl = this.queryService.get(index, 'station', search, limit, page)
    const {body} = await this.esService.search(stationDsl)
    return this.normalizer.region('station', body.hits)
  }

  async searchPOI(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const poiDsl = this.queryService.get(index, 'poi', search, limit, page)
    const {body} = await this.esService.search(poiDsl)
    return this.normalizer.region('poi', body.hits)
  }

  async searchAirport(search: string, {limit, page}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const airportDsl = this.queryService.get(index, 'airport', search, limit, page)
    const {body} = await this.esService.search(airportDsl)
    return this.normalizer.region('airport', body.hits)
  }

  async searchWithDistance(distance: string, lat: number, lon: number, {limit = 10, page = 1}) {
    const index = this.configService.get('ELASTICSEARCH_INDEX')
    const distanceDsl = this.queryService.getDistance(index, distance, lat, lon, limit, page)
    const {body} = await this.esService.search(distanceDsl)
    return body.hits
  }

  async searchCitiesProvinceKR(search: string, {limit = 10, page = 1}) {
    const citiesProvinceKRDsl = this.queryService.getCitiesProvinceKR(search, limit, page)
    const {body} = await this.esService.msearch(citiesProvinceKRDsl)
    const [cities, province] = body.responses
    return {
      cities: this.normalizer.districtKRCities(cities.hits),
      province: this.normalizer.districtKRProvince(province.hits)
    }
  }
}
