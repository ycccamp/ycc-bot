import {Script, createContext} from 'vm'

import {info} from './logs'

export function safeEval(code: string) {
  try {
    info(`Running Code: ${code}`)

    const script = new Script(code)
    const context = createContext(global)

    return String(script.runInContext(context))
  } catch (error) {
    return `${error.name}: ${error.message}`
  }
}
