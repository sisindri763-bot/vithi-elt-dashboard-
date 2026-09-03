import Sidebar from "@/components/sidebar/Sidebar"
import { SidebarProvider } from "@/contexts/SidebarContext"
import "./globals.css"

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main 
        className="flex-1 transition-all duration-300" 
        style={{ 
          minHeight: '100vh',
          marginLeft: 'var(--sidebar-width, 256px)' 
        }}
      >
        {children}
      </main>
    </>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --sidebar-width: 256px;
            }
          `
        }} />
      </head>
      <body style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <SidebarProvider>
          <div className="flex">
            <LayoutContent>{children}</LayoutContent>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}