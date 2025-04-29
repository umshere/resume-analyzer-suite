import { NavigationBar } from '@/components/shared/NavigationBar'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <main className="container mx-auto py-6 px-4">{children}</main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
