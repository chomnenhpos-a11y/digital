const setupInterceptors = (axiosClient) => {
  // Request Interceptor
  axiosClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response Interceptor
  axiosClient.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response) {
        const { status } = error.response

        if (status === 401) {
          console.log('Unauthorized - Token expired or invalid')

          localStorage.removeItem('token')
          localStorage.removeItem('user')
          
          window.dispatchEvent(new Event('auth:logout'))
        }

        if (status === 403) {
          console.log('Forbidden - You do not have permission')
        }

        if (status === 404) {
          console.log('Resource not found')
        }

        if (status >= 500) {
          console.log('Server error')
        }
      } else if (error.request) {
        console.log('No response from server')
      } else {
        console.log('Request error:', error.message)
      }

      return Promise.reject(error)
    }
  )
}

export default setupInterceptors