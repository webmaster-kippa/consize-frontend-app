import { CertificateTemplate, CreateCertificate } from '@/type-definitions/cert-builder'
import http from './base'

export const myCertificates = async (): Promise<any> =>
  http.get({
    url: `certificates/`,
  })

export const createCertificate = async (payload: CreateCertificate): Promise<any> =>
  http.post({
    url: `certificates/`,
    body: payload
  })

export const fetchCertificateByID = async (id: string): Promise<any> =>
  http.get({
    url: `certificates/${id}`,
  })

export const fetchOpenCertificateByID = async (id: string): Promise<any> =>
  http.get({
    url: `certificates/open/${id}`,
  })


export const updateCertificateByID = async (id: string, data: { components: CertificateTemplate, name?: string }): Promise<any> =>
  http.put({
    url: `certificates/${id}`,
    body: data
  })


export const duplicateCertificateByID = async (id: string, data: { name?: string }): Promise<any> =>
  http.post({
    url: `certificates/${id}`,
    body: data
  })

export const deleteCertificateByID = async (id: string): Promise<any> =>
  http.delete({
    url: `certificates/${id}`,
  })