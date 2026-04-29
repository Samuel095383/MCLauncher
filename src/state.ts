import type { Account } from 'eml-lib'
import logger from 'electron-log/renderer'

// temp types until eml-lib exports them
export interface ISkin {
  id: string
  url: string
  state: 'active' | 'inactive'
  variant: 'classic' | 'slim'
}

export interface ICape {
  id: string
  url: string
  state: 'active' | 'inactive'
  alias: string
}

export interface IAvatar {
  id: string
  /**
   * May be `null` if the `Skin` class is initialized from the main process.
   */
  url: string | null
}

export type ViewName = 'loading' | 'login' | 'home' | 'settings'
export type BlockingViewName = 'maintenance' | 'update'

let currentAccount: Account | null = null
let currentAssets: { skin: ISkin | null; cape: ICape | null; avatar: IAvatar | null } | null = null

export function getUser() {
  return currentAccount
}

export function setUser(account: Account, assets: { skin: ISkin | null; cape: ICape | null; avatar: IAvatar | null }) {
  currentAccount = account
  currentAssets = assets
  updateUserInterface()
}

export function logout() {
  currentAccount = null
  currentAssets = null
  const nameEl = document.getElementById('user-name')
  if (nameEl) nameEl.innerText = ''
}

function updateUserInterface() {
  if (!currentAccount || !currentAssets) return

  logger.log('Updating UI for user:', currentAccount.name)

  const nameEl = document.getElementById('user-name')
  const avatarEl = document.getElementById('user-avatar') as HTMLImageElement
  const nameSettingsEl = document.getElementById('settings-user-name')
  const uuidSettingsEl = document.getElementById('settings-user-uuid')
  const typeSettingsEl = document.getElementById('settings-user-type')
  const avatarSettingsEl = document.getElementById('settings-user-avatar') as HTMLImageElement

  if (nameEl) nameEl.innerText = currentAccount.name
  if (avatarEl) avatarEl.src = currentAssets.avatar?.url ?? 'https://minotar.net/avatar/steve/256.png'
  if (nameSettingsEl) nameSettingsEl.innerText = currentAccount.name
  if (uuidSettingsEl) uuidSettingsEl.innerText = `UUID: ${currentAccount.uuid}`
  if (typeSettingsEl) typeSettingsEl.innerHTML = getAccountIcon(currentAccount.meta.type)
  if (avatarSettingsEl) avatarSettingsEl.src = currentAssets.avatar?.url ?? 'https://minotar.net/avatar/steve/256.png'
}

export function setView(view: ViewName) {
  const target = document.querySelector(`.view[data-view="${view}"]`) as HTMLElement
  if (!target) return logger.error(`View ${view} not found`)

  const isOverlay = target.classList.contains('overlay')

  if (view === 'settings') resetSettingsTab()

  if (!isOverlay) {
    document.querySelectorAll('.view').forEach((el) => {
      if (!el.classList.contains('overlay')) {
        el.classList.remove('active')
      }
    })
  }

  target.classList.add('active')
}

export function setBlockingView(view: BlockingViewName) {
  setTimeout(() => {
    document.querySelector('div#view-loading')?.classList.add('loaded')
  }, 400)
  setTimeout(() => {
    document.querySelector(`div#view-${view}`)?.classList.add('loaded')
  }, 200)
}

export function closeOverlay(view: ViewName) {
  const target = document.querySelector(`.view[data-view="${view}"]`)
  target?.classList.remove('active')
}

function getAccountIcon(type: 'msa' | 'yggdrasil' | 'azuriom' | 'crack') {
  switch (type) {
    case 'msa':
      return '<i class="fa-brands fa-microsoft"></i>Microsoft account'
    case 'yggdrasil':
      return '<i class="fa-solid fa-user"></i>Yggdrasil account'
    case 'azuriom':
      return '<i class="fa-brands fa-globe"></i>Azuriom account'
    case 'crack':
      return '<i class="fa-solid fa-user-slash"></i>Cracked account'
    default:
      return 'Unknown account type'
  }
}

function resetSettingsTab() {
  const tabButtons = document.querySelectorAll('.nav-btn')
  const tabContents = document.querySelectorAll('.tab-content')
  tabButtons.forEach((b) => b.classList.remove('active'))
  tabContents.forEach((content) => content.classList.remove('active'))

  tabButtons[0].classList.add('active')
  tabContents[0].classList.add('active')
}


