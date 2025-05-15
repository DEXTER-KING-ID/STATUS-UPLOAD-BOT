import baileys from '@whiskeysockets/baileys'
import P from 'pino'
import qrcode from 'qrcode'

// Destructure manually because baileys is a CommonJS default export
const {
  default: makeWASocket,
  useSingleFileAuthState
} = baileys

const { state, saveState } = useSingleFileAuthState('./auth.json')

let currentQR = null

export const getQRBuffer = async () => {
  if (!currentQR) return null
  return await qrcode.toBuffer(currentQR)
}

export const startSock = async () => {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal: true,
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on('connection.update', async ({ connection, qr }) => {
    if (qr) {
      currentQR = qr
      console.log('🔄 QR refreshed')
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp Connected!')
      await sock.sendMessage('status@broadcast', {
        text: '🚀 Bot Connected! This is an automated status update!'
      })
    }
  })

  return sock
}
