import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Condition implements Generator {

  Condition () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Condition> {
    const condition: fhir.Condition = { resourceType: 'Condition' } as fhir.Condition
    if (profile) condition.meta = { profile: [profile] }

    return new Promise<fhir.Condition>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Condition.id')) {
        condition.id = String(resource.get('Condition.id')?.value || '')
      }

      const _meta = keys.filter(_ => _.startsWith('Condition.meta'))
      if (_meta.length) {
        const meta: fhir.Meta = {}
        if (resource.has('Condition.meta.Meta.versionId')) {
          meta.versionId = String(resource.get('Condition.meta.Meta.versionId')?.value || '')
        }
        if (resource.has('Condition.meta.Meta.source')) {
          meta.source = String(resource.get('Condition.meta.Meta.source')?.value || '')
        }
        if (resource.has('Condition.meta.Meta.profile')) {
          meta.profile = [String(resource.get('Condition.meta.Meta.profile')?.value || '')]
        }
        if (resource.has('Condition.meta.Meta.security')) {
          const item = resource.get('Condition.meta.Meta.security')
          meta.security = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        if (resource.has('Condition.meta.Meta.tag')) {
          const item = resource.get('Condition.meta.Meta.tag')
          meta.tag = [DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})]
        }
        condition.meta = {...condition.meta, ...meta}
      }

      const conditionIdentifier = keys.filter(_ => _.startsWith('Condition.identifier'))
      if (conditionIdentifier.length) {
        const identifier: fhir.Identifier = {}
        if (resource.has('Condition.identifier.Identifier.system')) {
          identifier.system = String(resource.get('Condition.identifier.Identifier.system')?.value || '')
        }
        if (resource.has('Condition.identifier.Identifier.value')) {
          identifier.value = String(resource.get('Condition.identifier.Identifier.value')?.value || '')
        }

        condition.identifier = [identifier]
      }

      if (resource.has('Condition.clinicalStatus')) {
        const item = resource.get('Condition.clinicalStatus')
        condition.clinicalStatus = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }
      if (resource.has('Condition.verificationStatus')) {
        const item = resource.get('Condition.verificationStatus')
        condition.verificationStatus = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }
      if (resource.has('Condition.category')) {
        const item = resource.get('Condition.category')
        condition.category = [DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )]
      }
      if (resource.has('Condition.severity')) {
        const item = resource.get('Condition.severity')
        condition.severity = DataTypeFactory.createCodeableConcept({system: item.fixedUri, code: String(item.value)})
      }
      if (resource.has('Condition.code')) {
        const item = resource.get('Condition.code')
        condition.code = DataTypeFactory.createCodeableConcept(DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)}))
      }
      if (resource.has('Condition.bodySite')) {
        const item = resource.get('Condition.bodySite')
        condition.bodySite = [DataTypeFactory.createCodeableConcept(
          DataTypeFactory.createCoding({system: item.fixedUri, code: String(item.value)})
        )]
      }

      const subject = FHIRUtil.searchForReference(keys, resource, 'Condition.subject.Reference.')
      if (subject) condition.subject = subject

      const encounter = FHIRUtil.searchForReference(keys, resource, 'Condition.encounter.Reference.')
      if (encounter) condition.encounter = encounter

      if (resource.has('Condition.onset[x]') || resource.has('Condition.onset[x].dateTime')) {
        const item = resource.get('Condition.onset[x]') || resource.get('Condition.onset[x].dateTime')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          condition.onsetDateTime = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Condition.abatement[x].dateTime')) {
        const item = resource.get('Condition.abatement[x].dateTime')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          condition.abatementDateTime = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }
      if (resource.has('Condition.abatement[x].string')) {
        const item = resource.get('Condition.abatement[x].string')
        condition.abatementString = String(item.value)
      }
      const abatementPeriod = keys.filter(_ => _.startsWith('Condition.abatement[x].Period'))
      if (abatementPeriod.length) {
        const period: fhir.Period = {}
        if (resource.has('Condition.abatement[x].Period.start')) {
          const item = resource.get('Condition.abatement[x].Period.start')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.start = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }
        if (resource.has('Condition.abatement[x].Period.end')) {
          const item = resource.get('Condition.abatement[x].Period.end')
          try {
            let date = item.value
            if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
            period.end = DataTypeFactory.createDateString(date)
          } catch (e) { log.error('Date insertion error.', e) }
        }

        const _period = DataTypeFactory.createPeriod(period).toJSON()
        if (!FHIRUtil.isEmpty(_period)) {
          condition.abatementPeriod = _period
        }
      }
      const abatementAge = keys.filter(_ => _.startsWith('Condition.abatement[x].Age'))
      if (abatementAge.length) {
        const age: fhir.Age = {}
        if (resource.has('Condition.abatement[x].Age.value')) {
          const item = resource.get('Condition.abatement[x].Age.value')
          age.value = Number(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.comparator')) {
          const item = resource.get('Condition.abatement[x].Age.comparator')
          age.comparator = String(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.unit')) {
          const item = resource.get('Condition.abatement[x].Age.unit')
          age.unit = String(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.system')) {
          const item = resource.get('Condition.abatement[x].Age.system')
          age.system = String(item.value)
        }
        if (resource.has('Condition.abatement[x].Age.code')) {
          const item = resource.get('Condition.abatement[x].Age.code')
          age.code = String(item.value)
        }

        const _age = DataTypeFactory.createAge(age).toJSON()
        if (!FHIRUtil.isEmpty(_age)) {
          condition.abatementAge = _age
        }
      }

      if (resource.has('Condition.recordedDate')) {
        const item = resource.get('Condition.recordedDate')
        try {
          let date = item.value
          if (!(item.value instanceof Date)) { date = DataTypeFactory.createDate(String(item.value)) }
          condition.recordedDate = DataTypeFactory.createDateString(date)
        } catch (e) { log.error('Date insertion error.', e) }
      }

      const recorder = FHIRUtil.searchForReference(keys, resource, 'Condition.recorder.Reference.')
      if (recorder) condition.recorder = recorder

      const asserter = FHIRUtil.searchForReference(keys, resource, 'Condition.asserter.Reference.')
      if (asserter) condition.asserter = asserter

      condition.id = this.generateID(condition)

      if (condition.id) resolve(condition)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Condition): string {
    let value: string = ''

    if (resource.id) {
      value += resource.id
    } else {
      if (resource.subject?.reference) value += resource.subject.reference
      if (resource.code?.coding && resource.code.coding.length) value += resource.code.coding[0].code
      if (resource.onsetDateTime) value += resource.onsetDateTime
      if (resource.abatementDateTime) value += resource.abatementDateTime
    }

    return FHIRUtil.hash(value)
  }

}
