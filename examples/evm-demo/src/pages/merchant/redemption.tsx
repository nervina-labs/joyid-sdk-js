import { createSignal, onMount } from 'solid-js'

export default function MerchantRedemption() {
  const [redemptionData, setRedemptionData] = createSignal('')
  const [projectName, setProjectName] = createSignal('')
  const [cardColor, setCardColor] = createSignal('#E1AD01')

  onMount(() => {
    if (typeof window !== 'undefined') {
      const project = localStorage.getItem('merchantProjectName')
      const color = localStorage.getItem('merchantCardColor')
      console.log('Reading from localStorage:', { project, color })

      setProjectName(project || '1')
      setCardColor(color || '#E1AD01')
    }
  })

  const handleSave = async (e: Event) => {
    e.preventDefault()

    const username = localStorage.getItem('merchantUsername')
    if (!username) {
      alert('Error: Not logged in. Cannot get username.')
      return
    }

    const res = await fetch('/api/merchant-project-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName: projectName(),
        username: username,
      }),
    })

    const data = await res.json()

    if (data.success) {
      console.log('Project and Issuer created successfully:', data)
      alert(
        `Project created! Issuer ID: ${data.issuerId}, Collector ID: ${data.collectorId}`
      )
      // You can now proceed to the next step
    } else {
      console.error('Failed to create project:', data.message)
      alert(`Error: ${data.message}`)
    }
  }

  return (
    <form class="flex flex-col items-center mt-16" onSubmit={handleSave}>
      <h2 class="text-2xl mb-4">Redemption Data</h2>
      <div class="mb-2">
        Project Name: <span class="font-bold">{projectName()}</span>
      </div>
      <div class="mb-4 flex items-center">
        Card Colour:{' '}
        <span
          class="inline-block w-6 h-6 rounded ml-2"
          style={{ 'background-color': cardColor() }}></span>{' '}
        <span class="ml-2">{cardColor()}</span>
      </div>
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
