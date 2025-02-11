"use client"
import SearchMainStudents from '@/components/Dashboard/SearchMainStudents'
import Layout from '@/layouts/PageTransition'
import { studentsList } from '@/services/students'
import { StudentRecord as Student } from '@/type-definitions/secure.courses'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface ApiResponse {
  data: Student[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
  message: string
}

export default function StudentsPageContent () {
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState<number[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const searchParams = useSearchParams()
  const router = useRouter()
  const loadData = async function ({ pageParam }: { pageParam: number }) {
    const result = await studentsList(pageParam)
    return result.data
  }

  const { data, isFetching, refetch } =
    useQuery<ApiResponse>({
      queryKey: ['students', page],
      queryFn: () => loadData({ pageParam: page })
    })

  useEffect(() => {
    if (data) {
      setStudents(data.data)
      let range = 10
      let start = 0
      if (page > 8) {
        start = page - 5
      } else if (page > 5) {
        start = page - 3
      }

      setPages(Array.from({ length: data.totalPages }, (_, i) => i + 1).slice(start, start + range))
    }
  }, [data, page])
  useEffect(() => {
    if (searchParams.get("page")) {
      let pg = Number(searchParams.get("page"))
      setPage(pg)
    }
  }, [searchParams.get("page")])
  return (
    <Layout>
      <div className='w-full overflow-y-scroll  max-h-full'>
        <div className='w-full px-5 py-10'>
          <div className='flex justify-end items-center gap-4 pb-5'>
            <div className='w-72'>
              <SearchMainStudents students={students} />
            </div>

          </div>
          <div className='w-full'>
            <div className='min-h-[500px] w-full'>
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 w-full">
                  <tr className=' w-full'>
                    <th className="px-4 py-3">
                      <div className='flex items-center gap-3'>
                        Student name
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className='flex items-center gap-3'>
                        Phone number
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className='flex items-center gap-3'>
                        Email address
                      </div>
                    </th>
                    <th className="px-4 py-3">
                      <div className='flex items-center gap-3'>
                        Source
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && <tr className="border-b hover:bg-gray-100 cursor-pointer">
                    <th colSpan={5} scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      No students found
                    </th>
                  </tr>}
                  {
                    students.map((student: Student) => {
                      return <tr onClick={() => document.getElementById(student.id)?.click()} key={student.id} className="border-b hover:bg-gray-100 cursor-pointer">
                        <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap capitalize">{student.firstName} {student.otherNames}</th>
                        <td className="px-4 py-3">{student.phoneNumber}</td>
                        <td className="px-4 py-3">{student.email || '---'}</td>
                        <td className="px-4 py-3">{student.slackId ? "Slack" : "Whatsapp"}</td>
                        <td>
                          <Link href={`/dashboard/students/${student.id}`} id={student.id} />
                        </td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && <div className='flex justify-center py-4'>
              <ButtonGroup variant='outline' isAttached>
                <Button as={Link} href={`/dashboard/students?page=${page - 1}`} isDisabled={page === 1} className='font-medium' size={'sm'}>Previous</Button>
                {pages.map((i) => {
                  if ((i) === page) {
                    return (
                      <Button as={Link} href={`/dashboard/students?page=${page}`} className={`!font-medium bg-gray-200`} key={i} size={'sm'}>{i}</Button>
                    )
                  } else {
                    return (
                      <Button as={Link} href={`/dashboard/students?page=${i}`} className='!font-medium' key={i} size={'sm'}>{i}</Button>
                    )
                  }
                })}

                <Button as={Link} href={`/dashboard/students?page=${page + 1}`} isDisabled={page === data.totalPages} className='font-medium' size={'sm'}>Next</Button>
              </ButtonGroup>
            </div>}
          </div>
        </div>
      </div>
    </Layout>
  )
}
