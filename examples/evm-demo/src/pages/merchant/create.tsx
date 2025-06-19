import { createSignal, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import ColorPicker from 'solid-color-picker'

export default function MerchantCreate() {
  const [projectName, setProjectName] = createSignal('')
  const [cardColor, setCardColor] = createSignal('#E1AD01')
  const navi = useNavigate()

  onMount(() => {
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem('merchantLoggedIn') !== '1'
    ) {
      navi('/merchant')
    }
  })

  const handleNext = (e: Event) => {
    e.preventDefault()
    // Save to state or backend as needed
    navi('/merchant/redemption')
  }

  return (
    <form class="flex flex-col items-center mt-16" onSubmit={handleNext}>
      <h2 class="text-2xl mb-4">Create Project</h2>
      <input
        class="input input-bordered mb-2"
        type="text"
        placeholder="Project Name"
        value={projectName()}
        onInput={(e) => setProjectName(e.currentTarget.value)}
        required
      />
      <label class="mb-2">Card Colour:</label>
      <div class="mb-4">
        <ColorPicker color={cardColor()} onChange={setCardColor} />
      </div>
      <button class="btn btn-primary" type="submit">
        Next
      </button>
    </form>
  )
}
