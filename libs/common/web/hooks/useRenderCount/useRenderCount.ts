import useAccumulator from '../useAccumulator';

function useRenderCount() {
  return useAccumulator<number>((count) => (count ?? 0) + 1, [{}]).current;
}

export default useRenderCount;
