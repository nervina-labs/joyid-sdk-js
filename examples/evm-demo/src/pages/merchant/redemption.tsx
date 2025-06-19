import { createSignal, onMount } from 'solid-js'

export default function MerchantRedemption() {
  const [redemptionData, setRedemptionData] = createSignal('')
  const [projectName, setProjectName] = createSignal('')
  const [cardColor, setCardColor] = createSignal('#E1AD01')

  onMount(() => {
    if (typeof window !== 'undefined') {
      setProjectName(localStorage.getItem('merchantProjectName') || '')
      setCardColor(localStorage.getItem('merchantCardColor') || '#E1AD01')
    }
  })

  const handleSave = (e: Event) => {
    e.preventDefault()
    // Save redemption data to backend
    alert('Redemption data saved!')
  }

  return (
    <form class="flex flex-col items-center mt-16" onSubmit={handleSave}>
      <h2 class="text-2xl mb-4">Redemption Data</h2>
      <div class="mb-2">Project Name: <span class="font-bold">{projectName()}</span></div>
      <div class="mb-4 flex items-center">Card Colour: <span class="inline-block w-6 h-6 rounded ml-2" style={{ 'background-color': cardColor() }}></span> <span class="ml-2">{cardColor()}</span></div>
      <textarea
        class="textarea textarea-bordered mb-4"
        placeholder="Enter redemption instructions or data"
        value={redemptionData()}
        onInput={(e) => setRedemptionData(e.currentTarget.value)}
        required
      />
      <button class="btn btn-primary" type="submit">
        Create
      </button>
    </form>
  )
}
