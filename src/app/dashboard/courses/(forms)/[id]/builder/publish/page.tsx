"use client"
import ViewCourseDetails from '@/components/Courses/ViewCourseDetails'
import PhoneInput from '@/components/PhoneInput'
import Layout from '@/layouts/PageTransition'
import { fetchSingleCourse, updateCourse } from '@/services/secure.courses.service'
import { membersList } from '@/services/slack.services'
import { Distribution } from '@/type-definitions/callbacks'
import { Course, CourseStatus, CreateCoursePayload } from '@/type-definitions/secure.courses'
import { SlackUser } from '@/type-definitions/slack'
import { Select, Spinner } from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React from 'react'


interface ApiResponse {
  data: Course
  message: string
}


export default function page ({ params }: { params: { id: string } }) {
  const router = useRouter()
  const loadData = async function (payload: { course: string }) {
    const data = await fetchSingleCourse(payload.course)
    return data
  }
  const { data: courseDetails, isFetching, refetch } =
    useQuery<ApiResponse>({
      queryKey: ['course', params.id],
      queryFn: () => loadData({ course: params.id })
    })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: Partial<CreateCoursePayload> | Partial<Course> }) => updateCourse({
      ...data.payload
    }, data.id)
  })

  const togglePrivacy = async function () {
    if (courseDetails) {
      await updateMutation.mutateAsync({ id: courseDetails.data.id, payload: { private: !courseDetails.data.private } })
    }
    refetch()
  }

  const loadSlackContent = async function () {
    let result
    result = await membersList()
    return result.data
  }

  const { data: slackData, isFetching: slackProgress } =
    useQuery<{ members?: SlackUser[] }>({
      queryKey: ['slack-person'],
      queryFn: () => loadSlackContent()
    })

  const publishCourse = async function () {
    if (courseDetails) {
      await updateMutation.mutateAsync({ id: courseDetails.data.id, payload: { status: CourseStatus.PUBLISHED, } })
    }
    router.push(`/dashboard/courses/${params.id}`)
  }

  const attachSurvey = async function () {
    if (courseDetails) {
      await updateMutation.mutateAsync({ id: courseDetails.data.id, payload: { survey: "750c7074-4415-4ec9-8d17-9fb7eaf73b20" } })
      refetch()
    }
  }

  const detachSurvey = async function () {
    if (courseDetails) {
      await updateMutation.mutateAsync({ id: courseDetails.data.id, payload: { survey: null } })
      refetch()
    }
  }
  return (

    <Layout>
      <div className='w-full overflow-y-scroll'>
        <div className='flex-1 flex justify-center'>
          <div className='px-4 w-full h-screen'>
            <div className='justify-between flex items-center py-5'>
              <div className='font-semibold text-xl'>
                Alright, let's do some house-cleaning
              </div>

              {courseDetails && courseDetails.data.status !== CourseStatus.PUBLISHED && <div className='w-1/6 flex items-center gap-2'>
                <div className='w-8'>
                  {(updateMutation.isPending || isFetching) && <Spinner size={'sm'} />}
                </div>
                <button onClick={publishCourse} disabled={updateMutation.isPending} className='bg-primary-dark h-12 rounded-md text-white font-medium w-full'>Publish this course</button>
              </div>}
            </div>
            <div className='flex gap-5 mt-10'>
              <div className='w-1/2'>
                <div className='w-full'>
                  {courseDetails && <ViewCourseDetails course={courseDetails?.data} />}
                </div>
              </div>
              <div className='flex justify-center w-1/2'>
                {courseDetails && <div className='w-2/3 flex flex-col gap-8'>
                  <div>
                    <div className='flex w-full items-center gap-1'>
                      <button onClick={togglePrivacy} disabled={updateMutation.isPending} className={`${courseDetails.data.private ? 'border-primary-dark border' : 'bg-primary-dark text-white'} h-12 w-1/2 rounded-md  font-medium`}>
                        Public
                      </button>
                      <button onClick={togglePrivacy} disabled={updateMutation.isPending} className={`${courseDetails.data.private ? 'bg-primary-dark text-white' : 'border-primary-dark border'} h-12 w-1/2 rounded-md  font-medium`}>
                        Private
                      </button>
                    </div>
                    <div className='mt-1 text-sm'>You may set your course as private and it will only be visible to people you share it with. Public courses get listed on our public repository for potential students to discover</div>
                  </div>

                  {!courseDetails.data.survey && <div>
                    <button disabled={updateMutation.isPending} onClick={attachSurvey} className='bg-primary-dark h-12 rounded-md text-white font-medium w-full'>Attach default survey</button>
                    <div className='mt-1 text-sm'>This survey will be presented to your students at the end of the course to help gauge their opinions on this course.</div>
                  </div>}
                  {courseDetails.data.survey && <div>
                    <button disabled={updateMutation.isPending} onClick={detachSurvey} className='bg-primary-dark h-12 rounded-md text-white font-medium w-full'>Detatch default survey</button>
                    <div className='mt-1 text-sm'>This survey will no longer to sent to this course&apos;s students to gauge their acceptance of the course..</div>
                  </div>}

                  <div>
                    <div className='my-1 text-sm'>Do you want to try the course before publishing it?</div>
                    {courseDetails.data.distribution === Distribution.WHATSAPP && <div className='relative'>
                      <div className='absolute w-full top-0 left-0'>
                        <PhoneInput value='' onChange={() => { }} />
                      </div>
                      <button className='h-12 text-white absolute top-0 px-5 bg-primary-dark right-0'>
                        Send
                      </button>
                    </div>}

                    {courseDetails.data.distribution === Distribution.SLACK && slackData?.members && <div className='relative'>
                      <div className='absolute w-full top-0 left-0'>
                        <Select className='h-14'>
                          <option value="">Selec a workspace member</option>
                          {slackData.members.map(e => (<option value={e.id}>{e.profile.real_name}</option>))}
                        </Select>
                      </div>
                      <button className='h-12 text-white absolute top-1 right-2 px-5 bg-primary-dark rounded-lg'>
                        Send
                      </button>
                    </div>}

                  </div>

                </div>}
              </div>
            </div>
            <div className='h-60'></div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
