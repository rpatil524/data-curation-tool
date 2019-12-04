import axios from 'axios'
import { urls } from '@/common/api'
import { FHIRUtils } from '@/common/utils/fhir-util'

export class FhirService {

  constructor () {}

  search (resourceType: string, query: object, all?: boolean): Promise<fhir.Bundle> {
    const path = urls.f4hfhir + '/' + resourceType
    if (!all) {
      return new Promise((resolve, reject) => {
        axios.get(path + FHIRUtils.jsonToQueryString(query))
          .then(data => resolve(data.data as fhir.Bundle) )
          .catch(err => reject(err) )
      })
    } else {
      const q = Object.assign({}, query)
      q['_summary'] = 'count'
      return new Promise((resolve, reject) => {
        axios.get(path + FHIRUtils.jsonToQueryString(q))
          .then(data => {
            query['_count'] = data.data.total || '1'
            axios.get(path + FHIRUtils.jsonToQueryString(query))
              .then(result => resolve(result.data as fhir.Bundle) )
              .catch(err => reject(err) )
          })
          .catch(err => reject(err))
      })
    }
  }

}