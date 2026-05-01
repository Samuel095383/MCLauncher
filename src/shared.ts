import type { Account, IAvatar, ICape, ISkin } from 'eml-lib'
import { SkinViewer, WalkingAnimation } from 'skinview3d'
import { skin } from './ipc'
import { Dialog } from './views/dialog'

const shared = {
  account: null as Account | null,
  skins: null as ISkin[] | null,
  capes: null as ICape[] | null,
  avatar: null as IAvatar | null,
  mainSkinViewer: null as SkinViewer | null,
  auxiliarySkinViewer: null as SkinViewer | null,
  /**
   * `skins` should be updated before calling this function.
   */
  resetSkinViews: async () => {
    const skinCanvasSettingsEl = document.getElementById('skin-container') as HTMLCanvasElement
    const skinGallerySettingsEl = document.getElementById('skin-gallery')!

    skinGallerySettingsEl.innerHTML = ''

    const activeSkin = shared.skins?.find((s) => s.state === 'active') ?? {
      url: 'https://textures.minecraft.net/texture/d5c4ee5ce20aed9e33e866c66caa37178606234b3721084bf01d13320fb2eb3f',
      variant: 'classic'
    }
    const activeCape = shared.capes?.find((c) => c.state === 'active')

    if (!shared.mainSkinViewer) {
      shared.mainSkinViewer = new SkinViewer({
        canvas: skinCanvasSettingsEl,
        width: 530,
        height: 250,
        preserveDrawingBuffer: true
      })

      shared.mainSkinViewer.camera.position.set(-20, -2, 35)
      shared.mainSkinViewer.animation = new WalkingAnimation()
      shared.mainSkinViewer.animation!.speed = 0.3
      shared.mainSkinViewer.controls.enableZoom = false
      shared.mainSkinViewer.controls.enablePan = false
      shared.mainSkinViewer.controls.rotateSpeed = 0.3
    }

    shared.mainSkinViewer.loadSkin(activeSkin.url)
    if (activeCape) shared.mainSkinViewer.loadCape(activeCape.url)

    if (!shared.auxiliarySkinViewer) {
      shared.auxiliarySkinViewer = new SkinViewer({
        canvas: document.createElement('canvas'),
        width: 159.3,
        height: 180
      })

      shared.auxiliarySkinViewer.camera.position.set(-20, -2, 35)
      shared.auxiliarySkinViewer.zoom = 0.8
      shared.auxiliarySkinViewer.animation = new WalkingAnimation()
      shared.auxiliarySkinViewer.animation!.progress = 0.5
      shared.auxiliarySkinViewer.animation!.speed = 0
      shared.auxiliarySkinViewer.controls.enabled = false
    }

    for (const s of shared.skins ?? []) {
      const skinDiv = document.createElement('div')
      const skinEl = document.createElement('img') as HTMLImageElement

      skinDiv.id = `skin-${s.id}`
      skinDiv.classList.add('skin-preview')
      if (s.state === 'active') {
        skinDiv.classList.add('active')
      }

      if (s.state === 'inactive' && s.id !== 'steve' && s.id !== 'alex') {
        const deleteBtn = document.createElement('button')
        deleteBtn.classList.add('btn-delete-skin', 'btn', 'btn-secondary')
        deleteBtn.id = `btn-delete-skin-${s.id}`
        deleteBtn.innerHTML = '<i class="fa-solid fa-times"></i>'

        deleteBtn?.addEventListener('click', async (e) => {
          e.stopPropagation()
          deleteBtn.disabled = true
          try {
            shared.skins = await skin.deleteSkin(s.id)
            shared.resetSkinViews()
          } catch (err) {
            await Dialog.show('An error occurred while deleting the skin.', [{ text: 'OK', type: 'ok' }])
          }

          deleteBtn.disabled = false
        })

        skinDiv.appendChild(deleteBtn)
      }

      await shared.auxiliarySkinViewer.loadSkin(s.url)
      shared.auxiliarySkinViewer.render()
      skinEl.src = shared.auxiliarySkinViewer.canvas.toDataURL()

      skinDiv.appendChild(skinEl)

      skinDiv.addEventListener('click', async () => {
        if (s.state === 'active') return

        try {
          shared.skins = await skin.updateSkin(s.url, s.variant)
          shared.resetSkinViews()
          document.getElementById('settings-content')?.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err) {
          await Dialog.show('An error occurred while changing the skin. Please try again in few minutes.', [{ text: 'Close', type: 'ok' }])
        }
      })

      skinGallerySettingsEl?.appendChild(skinDiv)
    }
  }
}

export default shared


