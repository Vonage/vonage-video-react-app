import { contextBridge, ipcRenderer } from 'electron';

/**
 * Context bridge for the screen share picker window.
 * Exposes only the IPC channels needed for the picker UI:
 *   - onSources: receive the list of capturable sources from the main process
 *   - selectSource: send the user's choice back to the main process
 *   - cancel: tell the main process the user dismissed the picker
 */
contextBridge.exposeInMainWorld('pickerBridge', {
  onSources: (
    callback: (
      sources: { id: string; name: string; thumbnail: string; appIcon: string | null }[]
    ) => void
  ) => {
    ipcRenderer.on('screen-picker:sources', (_event, sources) => callback(sources));
  },
  selectSource: (sourceId: string) => {
    ipcRenderer.send('screen-picker:select', sourceId);
  },
  cancel: () => {
    ipcRenderer.send('screen-picker:cancel');
  },
});
