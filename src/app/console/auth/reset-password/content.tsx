'use client'
import { useFormik } from "formik"
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import { Button, useToast } from '@chakra-ui/react'
import KippaLogo from '@/components/Logo'
import Layout from '@/layouts/PageTransition'
import { adminAuthServices } from '@/services/admin'

const LoginSchema = Yup.object().shape({
  password: Yup.string()
    .required('Provide a password'),
  confirmPassword: Yup.string()
    .required('Please retype your password.')
    .oneOf([Yup.ref('password')], 'Your passwords do not match.')
})


export default function LoginHome ({ token }: { token: string }) {
  const toast = useToast()
  const router = useRouter()
  const loginFormik = useFormik({
    initialValues: {
      confirmPassword: '',
      password: ''
    },
    validationSchema: LoginSchema,
    validateOnMount: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        await adminAuthServices.resetPassword({ password: values.password, token })
        toast({
          title: 'Finished.',
          description: "Password changed successfully",
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        router.push("/console/auth/login")
      } catch (error) {
        debugger
        toast({
          title: 'Failed.',
          description: (error as any).message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
  })
  return (
    <Layout>
      <section id="box" className="bg-gray-100">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div className='flex justify-center pt-10'>
              <div>
                <a
                  className="mx-2 my-1 flex items-center lg:mb-0 lg:mt-0"
                  href="/">
                  <KippaLogo />
                </a>
              </div>
            </div>
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Set a new password
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={loginFormik.handleSubmit}>
                <div>
                  <div className='flex justify-between items-center'>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                  </div>
                  <input autoComplete='password' type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus-visible:!ring-primary-app focus-visible:!border-primary-app block w-full p-2.5 " onChange={loginFormik.handleChange}
                    value={loginFormik.values.password} onBlur={loginFormik.handleBlur} />
                </div>
                <div>
                  <div className='flex justify-between items-center'>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900">Confirm new password</label>
                  </div>
                  <input autoComplete='confirmPassword' type="password" name="confirmPassword" id="confirmPassword" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus-visible:!ring-primary-app focus-visible:!border-primary-app block w-full p-2.5 " onChange={loginFormik.handleChange}
                    value={loginFormik.values.confirmPassword} onBlur={loginFormik.handleBlur} />
                </div>
                <Button isLoading={loginFormik.isSubmitting} _hover={(!loginFormik.isValid || loginFormik.isSubmitting) ? { background: 'gray.300' } : {}} isDisabled={!loginFormik.isValid} type="submit" className="w-full text-black bg-primary-app disabled:bg-primary-app/85 hover:bg-primary-app focus:ring-4 focus:outline-none focus:ring-primary-app font-medium rounded-lg text-sm px-5 py-2.5 text-center ">Sign in</Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
