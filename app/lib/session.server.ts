import { createCookieSessionStorage, redirect } from 'react-router'

const sessionSecret = process.env.SESSION_SECRET ?? 'session-secret'

const storage = createCookieSessionStorage({
  cookie: {
    name: '__admin_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
  },
})

export function getSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export const { commitSession, destroySession } = storage

export async function requireUserSession(request: Request) {
  const session = await getSession(request)
  if (session.get('authenticated') !== true) {
    throw redirect('/admin/login')
  }
  return session
}
