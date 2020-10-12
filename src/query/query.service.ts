import { Injectable } from '@nestjs/common';

const _queries = {
  hotel: function (q, limit, page) {
    let dsl = {
      from: ((page - 1) * limit),
      size: limit,
      _source: [],
      body: {
        query: {
          must: [{
            match: {
              'hotel_name.ignore_norm_shingle': q
            }
          }],
          should: [{
            match: {
              'hotel_name.nori': q
            }
          }]
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
                      analyzer: 'ngram_analyzer',
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
  city: function (q, limit, page) {
    let dsl = {
      from: ((page - 1) * limit),
      size: limit,
      _source: [],
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
  station: function (q, limit, page) {
    let dsl = {
      from: ((page - 1) * limit),
      size: limit,
      _source: [],
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
  poi: function (q, limit, page) {
    let dsl = {
      from: ((page - 1) * limit),
      size: limit,
      _source: [],
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
  airport: function (q, limit, page) {
    let dsl = {
      from: ((page - 1) * limit),
      size: limit,
      _source: [],
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
  }
}

@Injectable()
export class QueryService {
  private readonly queries: { [key: string]: any };
  
  constructor () {
    this.queries = _queries
  }

  get (type:string, q, limit, page) {
    return this.queries[type](q, limit, page)
  }
}
