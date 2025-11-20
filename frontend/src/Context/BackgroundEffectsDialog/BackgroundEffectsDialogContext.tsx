import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface BackgroundEffectsDialogContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const BackgroundEffectsDialogContext = createContext<
  BackgroundEffectsDialogContextType | undefined
>(undefined);

interface BackgroundEffectsDialogProviderProps {
  children: ReactNode;
}

/**
 * BackgroundEffectsDialogProvider
 *
 * Provides context for managing the BackgroundEffectsDialog state across components.
 * This allows any child component to open or close the background effects dialog.
 * @param {BackgroundEffectsDialogProviderProps} props - The props for the component.
 * @property {ReactNode} children - The child components.
 * @returns {React.ReactElement} - The BackgroundEffectsDialogProvider component
 */
export const BackgroundEffectsDialogProvider: React.FC<BackgroundEffectsDialogProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [isOpen]
  );

  return (
    <BackgroundEffectsDialogContext.Provider value={value}>
      {children}
    </BackgroundEffectsDialogContext.Provider>
  );
};

/**
 * useBackgroundEffectsDialog
 *
 * Custom hook to access the BackgroundEffectsDialog context.
 * @returns {BackgroundEffectsDialogContextType} The context value with isOpen, open, and close functions.
 * @throws {Error} If used outside of BackgroundEffectsDialogProvider.
 */
export const useBackgroundEffectsDialog = (): BackgroundEffectsDialogContextType => {
  const context = useContext(BackgroundEffectsDialogContext);
  if (!context) {
    throw new Error(
      'useBackgroundEffectsDialog must be used within a BackgroundEffectsDialogProvider'
    );
  }
  return context;
};
