import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

const _queries = {
  hotel: function (index, q, limit, page) {
    let dsl = {
      index,
      from: ((page - 1) * limit),
      size: limit,
      _source: ['hotel_id', 'hotel_name', 'hotel_geo_location', 'hotel_address_full', 'hotel_city', 'hotel_state_province', 'hotel_country', 'hotel_postal_code', 'hotel_rank', 'highlight'],
      body: {
        query: {
          bool: {
            must: [{
              match: {
                'hotel_name.ignore_norm_shingle': q
              }
            }],
            should: [{
              match: {
                'hotel_name.nori': q
              }
            },
            {
              match: {
                'hotel_name.ngram': q
              }
            },
            {
              match: {
                hotel_state_province: q
              }
            },
            {
              match: {
                hotel_city: q
              }
            },
            {
              match_phrase: {
                hotel_name: {
                  query: q,
                  slop: 5
                }
              }
            },
            {
              rank_feature: {
                field: 'hotel_rank',
                boost: 11
              }
            }]
          }
        },
        highlight: {
          pre_tags: ['$'],
          post_tags: ['?'],
          fields: {
            hotel_name: {
              highlight_query: {
                bool: {
                  should: [{
                    multi_match: {
                      query: q,
                      analyzer: 'edge_ngram_analyzer',
                      operator: 'and'
                    }
                  }, {
                    multi_match: {
                      query: q,
                      analyzer: 'standard'
                    }
                  }]
                }
              }
            },
            hotel_city: {
              highlight_query: {
                bool: {
                  should: [{
                    multi_match: {
                      query: q,
                      analyzer: 'standard'
                    }
                  }, {
                    multi_match: {
                      query: q,
                      analyzer: 'edge_ngram_analyzer',
                      operator: 'and'
                    }
                  }]
                }
              }
            },
            hotel_state_province: {
              highlight_query: {
                bool: {
                  should: [{
                    multi_match: {
                      query: q,
                      analyzer: 'standard'
                    }
                  }, {
                    multi_match: {
                      query: q,
                      analyzer: 'edge_ngram_analyzer',
                      operator: 'and'
                    }
                  }]
                }
              }
            }
          }
        }
      }
    }
    return dsl
  },
  city: function (index, q, limit, page) {
    let dsl = {
      index,
      from: ((page - 1) * limit),
      size: limit,
      _source: ['id', 'city', 'province_state', 'neighborhood', 'name_full', 'region_geo_location', 'highlight'],
      body: {
        query: {
          bool: {
            must: {
              multi_match: {
                query: q,
                fields: ['city.nori', 'city.ngram', 'province_state.nori', 'province_state.ngram', 'neighborhood.nori', 'neighborhood.ngram'],
                operator: 'and'
              }
            }
          }
        },
        highlight: {
          pre_tags: ['$'],
          post_tags: ['?'],
          fields: {
            name_full: {
              highlight_query: {
                bool: {
                  should: [{
                    multi_match: {
                      query: q,
                      analyzer: 'standard'
                    }
                  }, {
                    multi_match: {
                      query: q,
                      analyzer: 'edge_ngram_analyzer'
                    }
                  }]
                }
              }
            }
          }
        }
      }
    }
    return dsl
  },
  station: function (index, q, limit, page) {
    let dsl = {
      index,
      from: ((page - 1) * limit),
      size: limit,
      _source: ['id', 'train_station', 'metro_station', 'name_full', 'region_geo_location', 'highlight'],
      body: {
        query: {
          'multi_match': {
            query: q,
            fields: ['train_station.ngram', 'train_station.nori', 'metro_station.ngram', 'metro_station.nori']
          }
        },
        highlight: {
          pre_tags: ['$'],
          post_tags: ['?'],
          fields: {
            name_full: {
              highlight_query: {
                bool: {
                  should: [{
                    multi_match: {
                      query: q,
                      analyzer: 'standard'
                    }
                  }, {
                    multi_match: {
                      query: q,
                      analyzer: 'edge_ngram_analyzer'
                    }
                  }]
                }
              }
            }
          }
        }
      }
    }
    return dsl
  },
  poi: function (index, q, limit, page) {
    let dsl = {
      index,
      from: ((page - 1) * limit),
      size: limit,
      _source: ['id', 'point_of_interest', 'high_level_region', 'name_full', 'region_geo_location', 'highlight'],
      body: {
        query: {
          bool: {
            must: {
              multi_match: {
                query: q,
                fields: ['point_of_interest.ngram', 'point_of_interest.nori', 'high_level_region.ngram', 'high_level_region.nori']
              }
            },
            // 전라북도, 충청남도, 제주시
            must_not: ['3000400154', '3000691773', '553248635926569719'].map(e => { return { term: { id: e } } })
          }
        },
        highlight: {
          pre_tags: ['$'],
          post_tags: ['?'],
          fields: {
            name_full: {
              highlight_query: {
                bool: {
                  should: [{
                    multi_match: {
                      query: q,
                      analyzer: 'standard'
                    }
                  }, {
                    multi_match: {
                      query: q,
                      analyzer: 'edge_ngram_analyzer'
                    }
                  }]
                }
              }
            }
          }
        }
      }
    }
    return dsl
  },
  airport: function (index, q, limit, page) {
    let dsl = {
      index,
      from: ((page - 1) * limit),
      size: limit,
      _source: ['id', 'airport', 'name_full', 'region_geo_location', 'highlight'],
      body: {
        query: {
          'multi_match': {
            query: q,
            fields: ['airport']
          }
        },
        highlight: {
          pre_tags: ['$'],
          post_tags: ['?'],
          fields: {
            name_full: {
              highlight_query: {
                bool: {
                  should: [{
                    multi_match: {
                      query: q,
                      analyzer: 'standard'
                    }
                  }, {
                    multi_match: {
                      query: q,
                      analyzer: 'edge_ngram_analyzer'
                    }
                  }]
                }
              }
            }
          }
        }
      }
    }
    return dsl
  },
  distance: function (index, {distance = 5, lat, lon}, limit, page) {
    let dsl = {
      index,
      from: ((page - 1) * limit) || 0,
      size: limit,
      _source: ['hotel_id', 'hotel_name', 'hotel_geo_location', 'hotel_address_full', 'hotel_city', 'hotel_state_province', 'hotel_country', 'hotel_postal_code', 'highlight'],
      body: {
        query: {
          geo_distance: {
            distance: distance + 'km',
            hotel_geo_location: {
              lat: parseFloat(lat), // 40.758741 // float.6,
              lon: parseFloat(lon) // -73.989322 // float.6
            }
          }
        }
      }
    }
    return dsl
  },
  citiesProvinceKR: function (q, limit, page) {
    const boolMatch = (q || '').split(' ').map(e => {
      return e.trim()
    }).reduce((accumulate, term) => {
      accumulate.push({
        multi_match: {
          query: term,
          fields: ['label', 'name'],
          type: 'best_fields',
          analyzer: 'standard',
          operator: 'and'
        }
      })
      return accumulate
    }, [])

    const provinceQuery = {
      multi_match: {
        query: q,
        fields: ['name'],
        type: 'best_fields',
        operator: 'and',
        analyzer: 'standard'
      }
    }

    const highlightQuery = {
      pre_tags: ['$'],
      post_tags: ['?'],
      fields: {
        name_full: {
          highlight_query: {
            bool: {
              should: [{
                multi_match: {
                  query: q,
                  analyzer: 'standard'
                }
              }, {
                multi_match: {
                  query: q,
                  analyzer: 'edge_ngram_pcc_analyzer'
                }
              }]
            }
          }
        }
      }
    }

    const query = {
      body: [
        { index: 'cities_in_province_0.1.1' },
        { _source: ['id', 'name', 'name_full', 'label', 'type', 'geo_location'], query: { 'bool': { 'must': boolMatch } }, highlight: highlightQuery },
        { index: 'province_state_contain_cities_0.1.1' },
        { _source: ['id', 'name', 'name_full', 'geo_location'], query: { 'bool': { 'must': provinceQuery } }, highlight: highlightQuery }
      ]
    }

    return query
  }
}

@Injectable()
export class QueryService {
  private readonly queries: { [key: string]: any }
  
  constructor () {
    this.queries = _queries
  }

  get (index: string, type:string, q, limit, page) {
    return this.queries[type](index, q, limit, page)
  }

  getDistance (index: string, distance: string, lat: number, lon: number, limit, page) {
    return this.queries.distance(index, {distance, lat, lon}, limit, page)
  }

  getCitiesProvinceKR (q, limit, page) {
    return this.queries.citiesProvinceKR(q, limit, page)
  }
}
