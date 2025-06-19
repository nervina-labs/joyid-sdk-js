import { createSignal } from 'solid-js'

export default function MerchantRedemption() {
  const [redemptionData, setRedemptionData] = createSignal('')

  const handleSave = (e: Event) => {
    e.preventDefault()
    // Save redemption data to backend
    alert('Redemption data saved!')
  }

  return (
    <form class="flex flex-col items-center mt-16" onSubmit={handleSave}>
      <h2 class="text-2xl mb-4">Redemption Data</h2>
      <textarea
        class="textarea textarea-bordered mb-4"
        placeholder="Enter redemption instructions or data"
        value={redemptionData()}
        onInput={(e) => setRedemptionData(e.currentTarget.value)}
        required
      />
      <button class="btn btn-primary" type="submit">
        Save
      </button>
    </form>
  )
}
