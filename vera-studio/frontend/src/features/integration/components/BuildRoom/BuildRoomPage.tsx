import { useState } from 'react';
import { Button, Separator } from '../../../../components';
import { buildContent } from '../../../integration/constants';

const { content } = buildContent.middlePanel.buildRoom;

type BuildStatus = 'idle' | 'building' | 'done' | 'error';

const buildStages = [
  'Compiling source files...',
  'Applying design tokens...',
  'Optimizing assets...',
  'Creating bundle...',
  'Packaging artifact...',
];

type SaveFilePickerType = (options?: {
  suggestedName?: string;
  types?: Array<{ description: string; accept: Record<string, string[]> }>;
}) => Promise<{
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
}>;

function BuildRoomPage() {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleBuildClick() {
    setBuildStatus('building');
    setErrorMessage(null);
    setStageIndex(0);

    const stageInterval = setInterval(() => {
      setStageIndex((previous) => Math.min(previous + 1, buildStages.length - 1));
    }, 4000);

    try {
      const response = await fetch('/api/build/room', { method: 'POST' });

      clearInterval(stageInterval);

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? 'Build failed');
      }

      const blob = await response.blob();
      setBuildStatus('done');

      await saveFile(blob, 'room.zip');
    } catch (error) {
      clearInterval(stageInterval);
      setBuildStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  const isBuilding = buildStatus === 'building';

  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">{content.title}</label>

      <p className="text-xs text-slate-600 leading-relaxed">{content.description}</p>

      <Separator />

      {isBuilding && (
        <div className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Building your room...</span>
          </div>

          <div className="flex flex-col gap-1.5 pl-7">
            {buildStages.map((stage, index) => {
              const isActive = index === stageIndex;
              const isComplete = index < stageIndex;

              return (
                <div
                  key={stage}
                  className={[
                    'text-xs transition-all duration-500',
                    isActive ? 'text-blue-700 font-medium animate-pulse' : '',
                    isComplete ? 'text-slate-400 line-through' : '',
                    !isActive && !isComplete ? 'text-slate-300' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {stage}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {buildStatus === 'done' && (
        <div className="text-xs text-green-700! bg-green-50 border border-green-200! rounded-lg p-3">
          Room built successfully. Your download should have started automatically.
        </div>
      )}

      {buildStatus === 'error' && errorMessage && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {errorMessage}
        </div>
      )}

      <Button onClick={handleBuildClick} disabled={isBuilding}>
        {buildStatus === 'done' ? 'Build again' : 'Build room'}
      </Button>
    </>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function saveFile(blob: Blob, filename: string) {
  const hasFilePicker = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

  if (!hasFilePicker) {
    downloadBlob(blob, filename);
    return;
  }

  try {
    type WindowWithFilePicker = typeof window & { showSaveFilePicker: SaveFilePickerType };
    const showSaveFilePicker = (window as unknown as WindowWithFilePicker).showSaveFilePicker;

    const fileHandle = await showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: 'ZIP Archive',
          accept: { 'application/zip': ['.zip'] },
        },
      ],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === 'AbortError';
    if (!isAbort) {
      downloadBlob(blob, filename);
    }
  }
}

export default BuildRoomPage;
