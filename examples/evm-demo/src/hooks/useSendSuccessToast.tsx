import toast from 'solid-toast'
import { useAuthData } from './localStorage'

export const useSendSuccessToast = () => {
  const { authData } = useAuthData()
  return (txHash: string) => {
    toast.custom(
      (t) => {
        return (
          <div class="alert alert-success shadow-lg max-w-md">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="flex-col flex">
                <span>Transaction Sent. View on:</span>
                <a
                  class="link break-all"
                  href={`${authData.explorer}/tx/${txHash}`}
                  target="_blank"
                >
                  {txHash}
                </a>
              </div>
              <div class="flex-none">
                <button
                  class="btn btn-circle btn-outline btn-error btn-xs"
                  onClick={() => toast.dismiss(t.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )
      },
      {
        position: 'bottom-center',
        duration: 10000,
        unmountDelay: 0,
      }
    )
  }
}
