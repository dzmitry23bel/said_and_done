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
const PREDICTIONS = [];
