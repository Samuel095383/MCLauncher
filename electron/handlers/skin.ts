import { ipcMain } from 'electron'
import { type Account, Skin } from 'eml-lib'

let skin: Skin | null = null

export function registerSkinHandlers() {

  ipcMain.handle('skin:reload', async (_event, account?: Account) => {
    if (!skin && account) {
      skin = new Skin(account)
    } else if (skin) {
      await skin.reload()
    } else {
      console.error('No account provided and no skin loaded')
      return null
    }
  })

  ipcMain.handle('skin:get_skin', async (_event, account?: Account) => {
    console.log('HERE')
    if (account && !skin) {
      skin = new Skin(account)
    } else if (!account && !skin) {
      console.error('No account provided and no skin loaded')
      return null
    }

    return await skin!.getSkin()
  })

  ipcMain.handle('skin:get_cape', async (_event, account?: Account) => {
    if (account && !skin) {
      skin = new Skin(account)
    } else if (!account && !skin) {
      console.error('No account provided and no skin loaded')
      return null
    }

    return await skin!.getCape()
  })

  ipcMain.handle('skin:get_avatar', async (_event, account?: Account) => {
    if (account && !skin) {
      skin = new Skin(account)
    } else if (!account && !skin) {
      console.error('No account provided and no skin loaded')
      return null
    }

    return await skin!.getAvatar()
  })

  ipcMain.handle('skin:update_skin', async (_event, source: string | Blob, model?: 'classic' | 'slim') => {
    if (!skin) {
      return { success: false, error: 'No skin loaded' }
    }

    try {
      await skin.updateSkin(source, model)
      return skin.getSkin()
    } catch (err: any) {
      console.error('Failed to update skin:', err)
      return null
    }
  })

  ipcMain.handle('skin:update_cape', async (_event, source: string | Blob) => {
    if (!skin) {
      return { success: false, error: 'No skin loaded' }
    }

    try {
      await skin.updateCape(source)
      return skin.getCape()
    } catch (err: any) {
      console.error('Failed to update cape:', err)
      return null
    }
  })

  ipcMain.handle('skin:switch_cape', async (_event, id: string) => {
    if (!skin) {
      return { success: false, error: 'No skin loaded' }
    }

    try {
      await skin.switchCape(id)
      return skin.getCape()
    } catch (err: any) {
      console.error('Failed to switch cape:', err)
      return null
    }
  })

  ipcMain.handle('skin:delete_cape', async (_event) => {
    if (!skin) {
      return { success: false, error: 'No skin loaded' }
    }

    try {
      await skin.deleteCape()
      return skin.getCape()
    } catch (err: any) {
      console.error('Failed to delete cape:', err)
      return null
    }
  })

  ipcMain.handle('skin:hide_cape', async (_event) => {
    if (!skin) {
      return { success: false, error: 'No skin loaded' }
    }

    try {
      await skin.hideCape()
      return skin.getCape()
    } catch (err: any) {
      console.error('Failed to hide cape:', err)
      return null
    }
  })
}

