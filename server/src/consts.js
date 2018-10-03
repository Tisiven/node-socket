import internalIp from 'internal-ip'

export const DEV = process.env.NODE_ENV === 'development'
export const PORT = process.env.PORT || 3000
export const KEYS = ['aGRqYWhqZGpmbHNhamtsZGZqbGtz']

export const IP = internalIp.v4.sync()
