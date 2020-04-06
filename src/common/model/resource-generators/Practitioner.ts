import { DataTypeFactory } from './../factory/data-type-factory'
import { FHIRUtil } from './../../utils/fhir-util'
import { Generator } from './Generator'
import log from 'electron-log'

export class Practitioner implements Generator {

  Practitioner () {}

  public generateResource (resource: Map<string, BufferResource>, profile: string | undefined): Promise<fhir.Practitioner> {
    const practitioner: fhir.Practitioner = { resourceType: 'Practitioner' } as fhir.Practitioner
    if (profile) practitioner.meta = { profile: [profile] }

    return new Promise<fhir.Practitioner>((resolve, reject) => {

      const keys: string[] = Array.from(resource.keys())

      if (resource.has('Practitioner.id')) {
        practitioner.id = String(resource.get('Practitioner.id')?.value || '')
      }
      if (resource.has('Practitioner.active')) {
        const item = resource.get('Practitioner.active')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) practitioner.active = String(item.value).toLowerCase() === 'true'
        } else {
          practitioner.active = String(item.value).toLowerCase() === 'true'
        }
      }
      if (resource.has('Practitioner.gender')) {
        const item = resource.get('Practitioner.gender')
        if (item.conceptMap) {
          const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
          if (targetValue) practitioner.gender = targetValue
        } else {
          practitioner.gender = String(item.value)
        }
      }
      const practitionerTelecom = keys.filter(_ => _.startsWith('Practitioner.telecom'))
      if (practitionerTelecom.length) {
        // TODO: ContactPoint.period
        const telecom: fhir.ContactPoint = {}
        if (resource.has('Practitioner.telecom.ContactPoint.system')) {
          const item = resource.get('Practitioner.telecom.ContactPoint.system')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) telecom.system = targetValue
          } else {
            telecom.system = String(item.value)
          }
        }
        if (resource.has('Practitioner.telecom.ContactPoint.value')) { telecom.value = String(resource.get('Practitioner.telecom.ContactPoint.value').value) }
        if (resource.has('Practitioner.telecom.ContactPoint.use')) {
          const item = resource.get('Practitioner.telecom.ContactPoint.use')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) telecom.use = targetValue
          } else {
            telecom.use = String(item.value)
          }
        }
        if (resource.has('Practitioner.telecom.ContactPoint.rank')) { telecom.rank = Number(resource.get('Practitioner.telecom.ContactPoint.rank').value) }

        const _telecom = DataTypeFactory.createContactPoint(telecom)

        if (practitioner.telecom?.length) practitioner.telecom.push(_telecom)
        else practitioner.telecom = [_telecom]
      }
      if (resource.has('Practitioner.birthDate')) {
        const item = resource.get('Practitioner.birthDate')

        if (item.sourceType === 'Date') {
          let date = item.value
          if (!(date instanceof Date)) { date = new Date(String(item.value)) }
          try {

            practitioner.birthDate = date.getFullYear() + '-' +
              ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2)

          } catch (e) { log.error('Date insertion error.', e) }
        }
      }

      const practitionerName = keys.filter(_ => _.startsWith('Practitioner.name'))
      if (practitionerName.length) {
        // TODO: HumanName.period
        const name: fhir.HumanName = {}
        if (resource.has('Practitioner.name.HumanName.use')) {
          const item = resource.get('Practitioner.name.HumanName.use')
          if (item.conceptMap) {
            const targetValue: string = FHIRUtil.getConceptMapTargetAsString(item.conceptMap, String(item.value))
            if (targetValue) name.use = targetValue
          } else {
            name.use = String(item.value)
          }
        }
        if (resource.has('Practitioner.name.HumanName.text')) { name.text = String(resource.get('Practitioner.name.HumanName.text').value) }
        if (resource.has('Practitioner.name.HumanName.family')) { name.family = String(resource.get('Practitioner.name.HumanName.family').value) }
        if (resource.has('Practitioner.name.HumanName.given')) { name.given = [String(resource.get('Practitioner.name.HumanName.given').value)] }
        if (resource.has('Practitioner.name.HumanName.prefix')) { name.prefix = [String(resource.get('Practitioner.name.HumanName.prefix').value)] }
        if (resource.has('Practitioner.name.HumanName.suffix')) { name.suffix = [String(resource.get('Practitioner.name.HumanName.suffix').value)] }

        const _name = DataTypeFactory.createHumanName(name)

        if (practitioner.name?.length) practitioner.name.push(_name)
        else practitioner.name = [_name]
      }

      const practitionerAddress = keys.filter(_ => _.startsWith('Practitioner.address'))
      if (practitionerAddress.length) {
        const address: fhir.Address = {}
        if (resource.has('Practitioner.address.Address.type')) { address.type = String(resource.get('Practitioner.address.Address.type').value) }
        if (resource.has('Practitioner.address.Address.text')) { address.text = String(resource.get('Practitioner.address.Address.text').value) }
        if (resource.has('Practitioner.address.Address.line')) { address.line = [String(resource.get('Practitioner.address.Address.line').value)] }
        if (resource.has('Practitioner.address.Address.city')) { address.city = String(resource.get('Practitioner.address.Address.city').value) }
        if (resource.has('Practitioner.address.Address.district')) { address.district = String(resource.get('Practitioner.address.Address.district').value) }
        if (resource.has('Practitioner.address.Address.state')) { address.state = String(resource.get('Practitioner.address.Address.state').value) }
        if (resource.has('Practitioner.address.Address.postalCode')) { address.postalCode = String(resource.get('Practitioner.address.Address.postalCode').value) }
        if (resource.has('Practitioner.address.Address.country')) { address.country = String(resource.get('Practitioner.address.Address.country').value) }

        const _address = DataTypeFactory.createAddress(address)

        if (practitioner.address?.length) practitioner.address.push(_address)
        else practitioner.address = [_address]
      }

      practitioner.id = this.generateID(practitioner)

      if (practitioner.id) resolve(practitioner)
      else reject('Id field is empty')
    })
  }

  public generateID (resource: fhir.Practitioner): string {
    let value: string = ''

    if (resource.id) value += resource.id

    return FHIRUtil.hash(value)
  }

}