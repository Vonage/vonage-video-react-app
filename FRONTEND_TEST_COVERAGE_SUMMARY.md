# Frontend Test Coverage Summary - Auto Generated

**Generated:** 2026-04-29  
**Total Analytics:** 33 Hooks + 6 APIs analyzed  
**E2E Test Suites:** 11 files with ~24 test cases  
**Overall Coverage:** **36%**

---

## Coverage Breakdown

### By Function Type
| Category | Total | Tested | Partial | Untested | Coverage |
| --- | --- | --- | --- | --- | --- |
| Context/State Hooks | 6 | 2 | 3 | 1 | 58% |
| Layout/Display Hooks | 6 | 2 | 0 | 4 | 33% |
| Chat/Messaging Hooks | 3 | 0 | 1 | 2 | 17% |
| Device/Media Hooks | 6 | 1 | 1 | 4 | 25% |
| Room/Navigation Hooks | 5 | 3 | 1 | 1 | 70% |
| UI/Control Hooks | 5 | 1 | 1 | 3 | 30% |
| Data/Utility Hooks | 3 | 0 | 1 | 2 | 17% |
| APIs | 6 | 0 | 3 | 3 | 25% |

### By Browser
- Browser projects in Playwright config: 4

---

## Top 10 Most-Tested Functions
| # | Function | Type | File | Mapped Suites | Coverage Mode | Critical Gap |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **useLayoutManager** | Hook | `frontend/src/hooks/useLayoutManager.tsx` | 3 | Direct | NO |
| 2 | **useMeetingRoom** | Hook | `frontend/src/hooks/useMeetingRoom.ts` | 3 | Direct | NO |
| 3 | **useArchives** | Hook | `frontend/src/hooks/useArchives.tsx` | 2 | Direct | NO |
| 4 | **useRightPanel** | Hook | `frontend/src/hooks/useRightPanel.tsx` | 2 | Direct | NO |
| 5 | **useRoomName** | Hook | `frontend/src/hooks/useRoomName.tsx` | 2 | Direct | NO |
| 6 | **useSessionContext** | Hook | `frontend/src/hooks/useSessionContext.tsx` | 2 | Direct | NO |
| 7 | **useSubscribersInDisplayOrder** | Hook | `frontend/src/hooks/useSubscribersInDisplayOrder.tsx` | 2 | Direct | NO |
| 8 | **useWaitingRoom** | Hook | `frontend/src/hooks/useWaitingRoom.ts` | 2 | Direct | NO |
| 9 | **useActiveSpeaker** | Hook | `frontend/src/hooks/useActiveSpeaker.tsx` | 1 | Indirect | NO |
| 10 | **useAudioLevels** | Hook | `frontend/src/hooks/useAudioLevels.tsx` | 1 | Indirect | NO |

---

## Top 10 Least-Tested Functions
| # | Function | Type | File | Mapped Suites | Risk | Critical Gap |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **useBackgroundPublisherContext** (CRITICAL) | Hook | `frontend/src/hooks/useBackgroundPublisherContext.tsx` | 0 | High | YES |
| 2 | **useDateTime** (CRITICAL) | Hook | `frontend/src/hooks/useDateTime.tsx` | 0 | High | YES |
| 3 | **useDropdownResizeObserver** (CRITICAL) | Hook | `frontend/src/hooks/useDropdownResizeObserver.tsx` | 0 | High | YES |
| 4 | **useElementDimensions** (CRITICAL) | Hook | `frontend/src/hooks/useElementDimensions.tsx` | 0 | High | YES |
| 5 | **useEmoji** (CRITICAL) | Hook | `frontend/src/hooks/useEmoji.tsx` | 0 | High | YES |
| 6 | **useIsSmallViewport** (CRITICAL) | Hook | `frontend/src/hooks/useIsSmallViewport.tsx` | 0 | High | YES |
| 7 | **useIsTabletViewport** (CRITICAL) | Hook | `frontend/src/hooks/useIsTabletViewport.tsx` | 0 | High | YES |
| 8 | **usePreferredCameras** (CRITICAL) | Hook | `frontend/src/hooks/usePreferredCameras/usePreferredCameras.ts` | 0 | High | YES |
| 9 | **usePushToTalk** (CRITICAL) | Hook | `frontend/src/hooks/usePushToTalk.tsx` | 0 | High | YES |
| 10 | **useReceivingCaptions** (CRITICAL) | Hook | `frontend/src/hooks/useReceivingCaptions.tsx` | 0 | High | YES |

---

## Highlighted Function List
| Function | Type | File | Mapped Suites | Coverage Mode | Risk | Critical Gap |
| --- | --- | --- | --- | --- | --- | --- |
| **createArchiveFromServer** (CRITICAL) | API | `frontend/src/api/archiving/model.ts` | 0 | None | High | YES |
| **enableCaptions** (CRITICAL) | API | `frontend/src/api/captions.ts` | 0 | None | High | YES |
| **index** (CRITICAL) | API | `frontend/src/api/archiving/index.ts` | 0 | None | High | YES |
| **useBackgroundPublisherContext** (CRITICAL) | Hook | `frontend/src/hooks/useBackgroundPublisherContext.tsx` | 0 | None | High | YES |
| **useDateTime** (CRITICAL) | Hook | `frontend/src/hooks/useDateTime.tsx` | 0 | None | High | YES |
| **useDropdownResizeObserver** (CRITICAL) | Hook | `frontend/src/hooks/useDropdownResizeObserver.tsx` | 0 | None | High | YES |
| **useElementDimensions** (CRITICAL) | Hook | `frontend/src/hooks/useElementDimensions.tsx` | 0 | None | High | YES |
| **useEmoji** (CRITICAL) | Hook | `frontend/src/hooks/useEmoji.tsx` | 0 | None | High | YES |
| **useIsSmallViewport** (CRITICAL) | Hook | `frontend/src/hooks/useIsSmallViewport.tsx` | 0 | None | High | YES |
| **useIsTabletViewport** (CRITICAL) | Hook | `frontend/src/hooks/useIsTabletViewport.tsx` | 0 | None | High | YES |
| **usePreferredCameras** (CRITICAL) | Hook | `frontend/src/hooks/usePreferredCameras/usePreferredCameras.ts` | 0 | None | High | YES |
| **usePushToTalk** (CRITICAL) | Hook | `frontend/src/hooks/usePushToTalk.tsx` | 0 | None | High | YES |
| **useReceivingCaptions** (CRITICAL) | Hook | `frontend/src/hooks/useReceivingCaptions.tsx` | 0 | None | High | YES |
| **useRoomShareUrl** (CRITICAL) | Hook | `frontend/src/hooks/useRoomShareUrl.tsx` | 0 | None | High | YES |
| **useScreenShare** (CRITICAL) | Hook | `frontend/src/hooks/useScreenShare.tsx` | 0 | None | High | YES |
| **useSpeakingDetector** (CRITICAL) | Hook | `frontend/src/hooks/useSpeakingDetector.tsx` | 0 | None | High | YES |
| **useSubscriberTalking** (CRITICAL) | Hook | `frontend/src/hooks/useSubscriberTalking.tsx` | 0 | None | High | YES |
| **useToolbarButtons** (CRITICAL) | Hook | `frontend/src/hooks/useToolbarButtons.tsx` | 0 | None | High | YES |
| **useWindowWidth** (CRITICAL) | Hook | `frontend/src/hooks/useWindowWidth.tsx` | 0 | None | High | YES |
| **fetchCredentials** | API | `frontend/src/api/fetchCredentials.ts` | 1 | Indirect | Medium | NO |
| **reportFeedback** | API | `frontend/src/api/reportFeedback.ts` | 1 | Indirect | Medium | NO |
| **startArchiving** | API | `frontend/src/api/archiving/routes.ts` | 1 | Indirect | Medium | NO |
| **useActiveSpeaker** | Hook | `frontend/src/hooks/useActiveSpeaker.tsx` | 1 | Indirect | Medium | NO |
| **useArchives** | Hook | `frontend/src/hooks/useArchives.tsx` | 2 | Direct | Low | NO |
| **useAudioLevels** | Hook | `frontend/src/hooks/useAudioLevels.tsx` | 1 | Indirect | Medium | NO |
| **useChat** | Hook | `frontend/src/hooks/useChat.tsx` | 1 | Indirect | Medium | NO |
| **useCollectBrowserInformation** | Hook | `frontend/src/hooks/useCollectBrowserInformation.tsx` | 1 | Indirect | Medium | NO |
| **useGoodByePage** | Hook | `frontend/src/hooks/useGoodByePage.ts` | 1 | Indirect | Medium | NO |
| **useLayoutManager** | Hook | `frontend/src/hooks/useLayoutManager.tsx` | 3 | Direct | Low | NO |
| **useMeetingRoom** | Hook | `frontend/src/hooks/useMeetingRoom.ts` | 3 | Direct | Low | NO |
| **usePermissions** | Hook | `frontend/src/hooks/usePermissions.tsx` | 1 | Indirect | Medium | NO |
| **usePreviewPublisherContext** | Hook | `frontend/src/hooks/usePreviewPublisherContext.tsx` | 1 | Indirect | Medium | NO |
| **usePublisherContext** | Hook | `frontend/src/hooks/usePublisherContext.tsx` | 1 | Indirect | Medium | NO |
| **useRightPanel** | Hook | `frontend/src/hooks/useRightPanel.tsx` | 2 | Direct | Low | NO |
| **useRoomName** | Hook | `frontend/src/hooks/useRoomName.tsx` | 2 | Direct | Low | NO |
| **useSessionContext** | Hook | `frontend/src/hooks/useSessionContext.tsx` | 2 | Direct | Low | NO |
| **useSubscribersInDisplayOrder** | Hook | `frontend/src/hooks/useSubscribersInDisplayOrder.tsx` | 2 | Direct | Low | NO |
| **useUserContext** | Hook | `frontend/src/hooks/useUserContext.tsx` | 1 | Indirect | Medium | NO |
| **useWaitingRoom** | Hook | `frontend/src/hooks/useWaitingRoom.ts` | 2 | Direct | Low | NO |

---

## Summary Statistics
- Total frontend functions tracked: 39
- Tested (mapped by 2+ suites): 8
- Partial (mapped by 1 suite): 12
- Untested (0%): 19 functions

---

## Critical Gaps
- [CRITICAL] Error handling scenarios are not inferred from static suite mapping and should be validated with explicit failure-path tests.
- [CRITICAL] Function-to-suite coverage is heuristic and may miss indirect runtime paths.
- [CRITICAL] Untested (0%): 19 functions need at least one mapped e2e path.

---

## Risk Assessment
- High risk functions: 19
- Medium risk functions: 12
- Low risk functions: 8

---

## Method Notes
- This report is generated by static analysis and deterministic suite-to-function mapping heuristics.
- Runtime behavior can differ from static mapping; use this report as a regression signal, not an absolute runtime truth.
