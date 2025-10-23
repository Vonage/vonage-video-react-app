import React, { ReactElement } from 'react';
import { Box } from '@mui/material';
import classNames from 'classnames';

const UsernameInputSkeleton = (): ReactElement => {
  return (
    <form className="opacity-80 flex w-full flex-col justify-center px-6 md:relative md:top-[-48px] md:max-w-[480px]">
      <div className="mt-4 flex flex-col items-center justify-end">
        <Box
          className={classNames(
            'mb-2 text-[28px] leading-8 w-2/4',
            // skeleton like appearance
            'rounded-md bg-skeletonLike'
          )}
        >
          &nbsp;
        </Box>

        <Box
          className={classNames(
            'flex flex-col content-end py-2 text-lg decoration-solid w-2/3 ',
            // skeleton like appearance
            'rounded-md bg-skeletonLike'
          )}
        >
          &nbsp;
        </Box>

        <Box
          className={classNames(
            'mt-6 text-[24px] leading-8 w-2/4',
            // skeleton like appearance
            'rounded-md bg-skeletonLike'
          )}
        >
          &nbsp;
        </Box>

        <Box
          className={classNames(
            'mb-5 flex flex-wrap items-center justify-center w-2/4',
            // skeleton like appearance
            'rounded-md'
          )}
        >
          <Box
            className={classNames(
              'w-full rounded-md flex pl-0 text-[24px] leading-8 bg-skeletonLike',
              // skeleton like appearance
              'rounded-md bg-skeletonLike'
            )}
            sx={{
              marginTop: '20px',
            }}
          >
            &nbsp;
          </Box>
        </Box>

        <Box
          className={classNames('!bg-skeletonLike')}
          sx={{
            width: '117px',
            borderRadius: '24px',
            height: '48px',
          }}
        >
          &nbsp;
        </Box>
      </div>
    </form>
  );
};

export default UsernameInputSkeleton;
