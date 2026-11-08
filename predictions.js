/*
 * Prediction records. Add entries by hand, only from a quote and a source you
 * have in front of you. Never from memory.
 *
 * Fields (all strings; use "" when a value is unknown, and say so in notes):
 *
 *   id            Short unique identifier, e.g. "em-2024-robotaxi".
 *   speaker       One of: "Elon Musk", "Jensen Huang", "Mark Zuckerberg", "Jeff Bezos".
 *   claim         Exact quote, or wording as close to the speaker's as possible.
 *   said_on       Date of the statement, "YYYY-MM-DD".
 *   source_url    Link to the interview, post or transcript.
 *   source_time   Timestamp in the source, e.g. "12:34". Optional, "" if none.
 *   deadline      Date by which the claim can be checked, "YYYY-MM-DD", or "".
 *   status        One of: "pending", "happened", "partial", "not_happened", "too_early".
 *                 "happened", "partial" and "not_happened" require evidence_url.
 *                 Without public evidence use "pending" or "too_early".
 *   evidence_url  Public source that shows the outcome. "" if none yet.
 *   checked_on    Date the status was last checked, "YYYY-MM-DD".
 *                 Set it to the current date whenever you set or change status.
 *   notes         One or two sentences: what matched or did not match.
 *                 Mention here any field left empty because it is unknown.
 *
 * Example (shape only, not a real record):
 *
 *   {
 *     id: "xx-0000-example",
 *     speaker: "Speaker Name",
 *     claim: "Quoted words go here.",
 *     said_on: "2000-01-01",
 *     source_url: "https://example.com/interview",
 *     source_time: "",
 *     deadline: "",
 *     status: "pending",
 *     evidence_url: "",
 *     checked_on: "2000-01-02",
 *     notes: "Timestamp unknown."
 *   }
 */
const PREDICTIONS = [
  // Source: "The full-length interview with Elon Musk | The Economist", YouTube, published 2026-07-29.
  {
    id: "em-2026-ai-exceeds-humans-5y",
    speaker: "Elon Musk",
    claim: "I think AI may exceed the sum of human intelligence in… around five years… Roughly 5 years is my guess.",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "1:12",
    deadline: "2031-07-29",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is five years after the video's publication date; the recording date may be earlier. There is no agreed measure of \"the sum of human intelligence\"."
  },
  {
    id: "em-2026-ai-far-greater-10y",
    speaker: "Elon Musk",
    claim: "In 10 years I would expect artificial intelligence to be far greater than the sum of human intelligence, like far greater.",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "0:53",
    deadline: "2036-07-29",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Answer to a question about the world in 2036. Deadline is ten years after the video's publication date."
  },
  {
    id: "em-2026-abundance-2036",
    speaker: "Elon Musk",
    claim: "The most likely outcome is an age of amazing abundance… where anyone can have anything they can think of… Let's see where we stand in 2036.",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "1:35",
    deadline: "2036-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "He names 2036 himself; deadline set to the end of that year. He adds that a major war could derail this."
  },
  {
    id: "em-2026-money-wont-matter-2036",
    speaker: "Elon Musk",
    claim: "I'll make another prediction. Money won't matter in 2036.",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "4:38",
    deadline: "2036-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "He names 2036 himself; deadline set to the end of that year."
  },
  {
    id: "em-2026-humans-not-in-control-10y",
    speaker: "Elon Musk",
    claim: "Asked \"You're sure that humans will no longer be in control in 10 years time?\", he answered: \"I think it is unlikely.\"",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "6:28",
    deadline: "2036-07-29",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "His answer refers to humans staying in control of AI. Deadline is ten years after the video's publication date."
  },
  {
    id: "em-2026-ai-robots-dominate-10y",
    speaker: "Elon Musk",
    claim: "AI and robots will really dominate everything… on a time scale that is less than 10 years.",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "1:24:04",
    deadline: "2036-07-29",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is ten years after the video's publication date."
  },
  {
    id: "em-2026-ai-robot-singularity-10y",
    speaker: "Elon Musk",
    claim: "The AI robot singularity is 10 years away.",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "1:24:29",
    deadline: "2036-07-29",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is ten years after the video's publication date. \"Singularity\" is not defined in the interview."
  },
  {
    id: "em-2026-uk-civil-war-20y",
    speaker: "Elon Musk",
    claim: "I would say civil war in Britain is probably 20 years away.",
    said_on: "2026-07-29",
    source_url: "https://www.youtube.com/watch?v=XuoqKYxDHVc",
    source_time: "1:24:29",
    deadline: "2046-07-29",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Earlier (1:04:06) he says it is inevitable \"if current trends continue\". Deadline is twenty years after the video's publication date; the number comes from auto-captions."
  }
];
