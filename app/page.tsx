import { ConversationInterface } from '@/components/ConversationInterface'
import { ModeToggle } from '@/components/ui/mode-toggle'

export default function HomePage() {
  return (
    <main className="flex flex-col h-screen">
      <header className="p-4 border-b flex justify-between items-center bg-background">
        <h1 className="text-xl font-semibold">Professional Network Search</h1>
        <nav className="flex gap-4 items-center">
          <a 
            href="/upload" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Upload Résumé
          </a>
          <ModeToggle />
        </nav>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <ConversationInterface />
      </div>
    </main>
  )
}
