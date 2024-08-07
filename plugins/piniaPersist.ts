import { PiniaPluginContext } from 'pinia'

export function piniaPersistedState({ store }: PiniaPluginContext) {
  const savedState = localStorage.getItem(`${store.$id}State`)
  
  if (savedState) {
    store.$patch(JSON.parse(savedState))
  }

  store.$subscribe((mutation, state) => {
    localStorage.setItem(`${store.$id}State`, JSON.stringify(state))
  })
}
