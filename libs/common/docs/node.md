# Node.js API

All exports available from `@vonage/video-common/node`. This entry re-exports everything from the [universal layer](./universal.md) — only Node.js-specific additions are documented here.

---

## schemas

Zod schemas for Vonage Video API server-side operations. Require `zod` and `@vonage/video` as dependencies.

```ts
import { SessionIdSchema, ArchiveOptionsSchema } from '@vonage/video-common/node/schemas';
```

### Session schemas

| Export | Validates |
|---|---|
| `SessionIdSchema` | Valid Vonage session ID string |
| `SessionKeySchema` | Valid Vonage session key string |

```ts
import { SessionIdSchema } from '@vonage/video-common/node/schemas';

const sessionId = SessionIdSchema.parse(rawId); // throws if invalid
```

### Archive schemas

| Export | Validates |
|---|---|
| `LayoutTypeSchema` | Archive layout type enum |
| `ArchiveOutputModeSchema` | Output mode (`composed`, `individual`) |
| `MediaModeSchema` | Media mode (`routed`, `relayed`) |
| `ArchiveModeSchema` | Archive mode (`manual`, `always`) |
| `StreamModeSchema` | Stream mode (`auto`, `manual`) |
| `ArchiveLayoutSchema` | Full archive layout configuration |
| `TranscriptionPropertiesSchema` | Transcription configuration |
| `BaseArchiveOptionsSchema` | Base archive creation options |
| `ArchiveOptionsWithMaxBitrateSchema` | Archive options with max bitrate constraint |
| `ArchiveOptionsWithQuantizationParameterSchema` | Archive options with quantization parameter |
| `ArchiveWithTranscriptionSchema` | Archive options that include transcription |
| `ArchiveWithoutTranscriptionSchema` | Archive options without transcription |
| `ArchiveOptionsSchema` | Union of all archive option variants |

```ts
import { ArchiveOptionsSchema } from '@vonage/video-common/node/schemas';

const options = ArchiveOptionsSchema.parse(requestBody);
// options is typed as the correct variant based on the input shape
```

---

## types

Re-exports all [universal types](./universal.md#types) plus archive-related types inferred from the schemas:

| Export | Description |
|---|---|
| `TranscriptionProperties` | Transcription configuration shape |
| `BaseArchiveOptions` | Base archive creation options shape |
| `ArchiveOptionsWithMaxBitrate` | Archive options with bitrate limit |
| `ArchiveOptionsWithQuantizationParameter` | Archive options with QP constraint |
| `ArchiveWithTranscription` | Archive options including transcription config |
| `ArchiveWithoutTranscription` | Archive options without transcription |

```ts
import type { ArchiveOptionsWithMaxBitrate } from '@vonage/video-common/node/types';
```

---

## assertions

Re-exports all [universal assertions](./universal.md#assertions). No Node-specific assertions are added.

## helpers

Re-exports all [universal helpers](./universal.md#helpers). No Node-specific helpers are added.



