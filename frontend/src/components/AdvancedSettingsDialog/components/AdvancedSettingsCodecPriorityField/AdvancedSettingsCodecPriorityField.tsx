import { useState } from 'react';
import type { DragEvent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type {
  AdvancedSettingsManualCodecOrder,
  AdvancedSettingsVideoCodec,
} from '../../types/types';

type AdvancedSettingsCodecPriorityFieldProps = {
  codecPriority: AdvancedSettingsManualCodecOrder;
  setCodecPriority: (value: AdvancedSettingsManualCodecOrder) => void;
};

const AdvancedSettingsCodecPriorityField = ({
  codecPriority,
  setCodecPriority,
}: AdvancedSettingsCodecPriorityFieldProps): ReactElement => {
  const { t } = useTranslation();
  const [draggedCodec, setDraggedCodec] = useState<AdvancedSettingsVideoCodec | null>(null);
  const [dropTargetCodec, setDropTargetCodec] = useState<AdvancedSettingsVideoCodec | null>(null);

  const handleDragStart = (event: DragEvent<HTMLLIElement>, codec: AdvancedSettingsVideoCodec) => {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', codec);
    }

    setDraggedCodec(codec);
    setDropTargetCodec(codec);
  };

  const handleDragEnd = () => {
    setDraggedCodec(null);
    setDropTargetCodec(null);
  };

  const handleDragOver = (
    event: DragEvent<HTMLLIElement>,
    targetCodec: AdvancedSettingsVideoCodec
  ) => {
    event.preventDefault();

    if (!draggedCodec || draggedCodec === targetCodec) return;

    setDropTargetCodec(targetCodec);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetCodec: AdvancedSettingsVideoCodec) => {
    event.preventDefault();

    const draggedCodecFromEvent = event.dataTransfer?.getData('text/plain') as
      | AdvancedSettingsVideoCodec
      | undefined;
    const activeDraggedCodec = draggedCodec ?? draggedCodecFromEvent;

    if (!activeDraggedCodec || activeDraggedCodec === targetCodec) {
      handleDragEnd();
      return;
    }

    const reorderedCodecs = reorderCodecPriority({
      codecPriority,
      draggedCodec: activeDraggedCodec,
      targetCodec,
    });

    setCodecPriority(reorderedCodecs);
    handleDragEnd();
  };

  return (
    <div className="flex flex-col gap-3 rounded-vera-medium  border-vera-border bg-vera-background px-4 py-3">
      <p className="font-vera-plain text-vera-body-base-semibold text-vera-secondary">
        {t('advancedSettings.video.codec.priority.label')}
      </p>

      <p className="font-vera-plain text-vera-caption text-vera-tertiary">
        {t('advancedSettings.video.codec.priority.description')}
      </p>

      <ol className="flex flex-col gap-2" data-testid="advanced-settings-codec-priority-list">
        {codecPriority.map((codec, index) => {
          const isDraggedCodec = draggedCodec === codec;
          const isDropTarget = dropTargetCodec === codec && draggedCodec !== codec;

          return (
            <li
              key={codec}
              draggable
              onDragStart={(event) => {
                handleDragStart(event, codec);
              }}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => {
                handleDragOver(event, codec);
              }}
              onDrop={(event) => {
                handleDrop(event, codec);
              }}
              className={classNames(
                'flex cursor-grab items-center gap-3 rounded-vera-medium border bg-vera-surface px-4 py-3',
                isDraggedCodec ? 'border-vera-primary opacity-60' : 'border-vera-border',
                isDropTarget ? 'border-vera-primary' : null
              )}
              data-testid={`advanced-settings-codec-priority-item-${codec}`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-vera-background font-vera-plain text-vera-caption text-vera-secondary">
                {index + 1}
              </span>

              <span className="font-vera-plain text-vera-body-base text-vera-secondary">
                {t(`advancedSettings.video.codec.priority.options.${codec}`)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

function reorderCodecPriority(args: {
  codecPriority: AdvancedSettingsManualCodecOrder;
  draggedCodec: AdvancedSettingsVideoCodec;
  targetCodec: AdvancedSettingsVideoCodec;
}): AdvancedSettingsManualCodecOrder {
  const { codecPriority, draggedCodec, targetCodec } = args;
  const reorderedCodecs = [...codecPriority];
  const draggedCodecIndex = reorderedCodecs.indexOf(draggedCodec);
  const targetCodecIndex = reorderedCodecs.indexOf(targetCodec);

  reorderedCodecs.splice(draggedCodecIndex, 1);
  reorderedCodecs.splice(targetCodecIndex, 0, draggedCodec);

  return reorderedCodecs as AdvancedSettingsManualCodecOrder;
}

export default AdvancedSettingsCodecPriorityField;
