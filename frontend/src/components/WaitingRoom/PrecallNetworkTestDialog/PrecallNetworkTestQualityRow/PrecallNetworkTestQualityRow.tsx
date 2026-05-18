import { ReactElement, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VividIcon from '@ui/VividIcon';
import { useTranslation } from 'react-i18next';

export type PrecallNetworkTestQualityRowProps = {
  label: string;
  score: number | null;
  supportTitle?: string;
};

const PrecallNetworkTestQualityRow = ({
  label,
  score,
  supportTitle,
}: PrecallNetworkTestQualityRowProps): ReactElement => {
  const { t } = useTranslation();

  const isSupported = useMemo(() => score !== null && score >= 3, [score]);

  const formattedScore = useMemo(() => {
    if (score === null) return '—';
    return `${score.toFixed(2)}/5`;
  }, [score]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        p: 1,
        textAlign: 'center',
      }}
      title={supportTitle}
    >
      <Typography
        variant="h6"
        className="text-vera-text-secondary"
        sx={{
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Typography variant="h5" sx={{ lineHeight: 1 }}>
        {isSupported ? (
          <VividIcon
            name="check-circle-line"
            customSize={-3}
            style={{ color: 'var(--vera-success)' }}
          />
        ) : (
          <VividIcon
            name="close-circle-line"
            customSize={-3}
            style={{ color: 'var(--vera-error)' }}
          />
        )}
      </Typography>
      <Typography variant="body1" className="text-vera-text-secondary" sx={{ ml: 2 }}>
        {t('waitingRoom.precallNetworkTest.qualityLabel')}
      </Typography>
      <Typography
        variant="h6"
        className="text-vera-text-secondary"
        sx={{
          fontWeight: 500,
        }}
      >
        {formattedScore}
      </Typography>
    </Box>
  );
};

export default PrecallNetworkTestQualityRow;
