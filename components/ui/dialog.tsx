'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DialogContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

function Dialog({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogTrigger must be used within Dialog')

  const handleClick = () => context.setIsOpen(true)

  if (asChild && typeof children === 'object' && children !== null && 'props' in children) {
    const child = children as React.ReactElement
    return <child.type {...child.props} onClick={handleClick} />
  }

  return <button onClick={handleClick}>{children}</button>
}

function DialogContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogContent must be used within Dialog')

  if (!context.isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => context.setIsOpen(false)}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${className}`}>
          {children}
        </div>
      </div>
    </>
  )
}

function DialogHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 pt-6 pb-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

function DialogTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  )
}

function DialogDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-gray-600 mt-2 ${className}`}>
      {children}
    </p>
  )
}

function DialogBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

function DialogFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  )
}

function DialogClose({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const context = useContext(DialogContext)
  if (!context) throw new Error('DialogClose must be used within Dialog')

  const handleClick = () => {
    onClick?.()
    context.setIsOpen(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
    >
      {children}
    </button>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
}
