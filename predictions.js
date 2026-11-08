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
  },

  // Source: "Joe Rogan Experience #1169 - Elon Musk", YouTube, 2018-09-07.
  {
    id: "em-2018-neuralink-announce-few-months",
    speaker: "Elon Musk",
    claim: "I think we'll have something interesting to announce in a few months that's at least an order of magnitude better than anything else, probably… better than anyone thinks is possible.",
    said_on: "2018-09-07",
    source_url: "https://www.youtube.com/watch?v=ycPr5-27vSI",
    source_time: "25:13",
    deadline: "2019-03-07",
    status: "partial",
    evidence_url: "https://geneticliteracyproject.org/2019/07/22/what-we-know-about-elon-musks-dramatic-plan-to-link-human-brains-to-computers-through-implants/",
    checked_on: "2026-11-08",
    notes: "Neuralink's first public presentation came on July 16, 2019, about ten months later; the source does not confirm the \"order of magnitude\" claim. Deadline: \"a few months\" read as six months."
  },
  {
    id: "em-2018-highway-autopilot-lane-changes",
    speaker: "Elon Musk",
    claim: "We're about to release the software that will enable you to just turn it on and it'll drive from highway on-ramp to highway exit, do lane changes to overtake other cars, go from one interchange to the next…",
    said_on: "2018-09-07",
    source_url: "https://www.youtube.com/watch?v=ycPr5-27vSI",
    source_time: "1:01:10",
    deadline: "2018-12-31",
    status: "partial",
    evidence_url: "https://electrek.co/2018/10/27/tesla-navigate-on-autopilot-demo-rollout/",
    checked_on: "2026-11-08",
    notes: "Navigate on Autopilot began rolling out in the US in late October 2018, but at launch the driver had to confirm every lane change. Deadline: \"about to\" read as the end of 2018."
  },
  {
    id: "em-2018-tesla-atari-games",
    speaker: "Elon Musk",
    claim: "We're just putting the Atari emulator in it, so you'll be able to play Missile Command and Lunar Lander and a bunch of other things.",
    said_on: "2018-09-07",
    source_url: "https://www.youtube.com/watch?v=ycPr5-27vSI",
    source_time: "58:40",
    deadline: "2018-12-31",
    status: "happened",
    evidence_url: "https://www.inverse.com/article/49356-tesla-autopilot-update-v9-video-shows-the-3-retro-atari-games-in-action",
    checked_on: "2026-11-08",
    notes: "Software V9 shipped with Missile Command, Lunar Lander and Centipede, reported on September 27, 2018. Deadline: \"just putting\" read as the end of 2018."
  }
];
