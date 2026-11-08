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
 *   chain         Optional. Id from CHAINS below, shared by records where the speaker
 *                 makes the same promise at different times. Leave it out otherwise.
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
// Repeated promises: the same claim made at different times. Records point here with `chain`.
const CHAINS = {
  "fsd-driverless": "Self-driving with no one at the wheel",
  "optimus-prototype": "Optimus humanoid robot prototype",
  "humans-to-mars": "People flying to Mars"
};

const PREDICTIONS = [
  // Source: "Elon Musk Just Predicted the Next 3 Years (Ron Baron Full Interview)", YouTube, published 2026-11-06.
  {
    id: "em-2026-ship42-tower-catch-week",
    speaker: "Elon Musk",
    claim: "…with ship 42… we can try to catch [it] with the tower. So, that's what we're going to do in about a week from now.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "43:39",
    deadline: "2026-11-13",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About an attempt to catch the Starship upper stage (Ship 42) with the launch tower arms; the auto-generated transcript reads \"catch up with the tower\". Deadline: \"about a week\" counted from the video's publication date; the recording date may be earlier."
  },
  {
    id: "em-2026-spacex-arr-100b-december",
    speaker: "Elon Musk",
    claim: "We are tracking to have an annual rate of revenue that is in excess of hundred billion in December.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "25:22",
    deadline: "2026-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About SpaceX's annualized revenue run rate in December 2026. Needs a public source for SpaceX revenue to be checked."
  },
  {
    id: "em-2026-spacex-q4-revenue-70pct",
    speaker: "Elon Musk",
    claim: "I'm not sure what the exact numbers will be Q3 to Q4, but probably something like 70%.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "19:48",
    deadline: "2026-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About SpaceX revenue growth from Q3 to Q4 2026, said right after a Q2-to-Q3 increase of \"over 80%\". Needs a public source for SpaceX quarterly revenue to be checked."
  },
  {
    id: "em-2026-spacex-arr-500b-dec-2027",
    speaker: "Elon Musk",
    claim: "It seems quite likely that our annual recurring revenue in December of next year will exceed 500 billion.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "25:47",
    deadline: "2027-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About SpaceX's annual recurring revenue in December 2027. He added it is \"not a promise\" but his \"best guess\", and that a trillion is \"not out of the question\" (about 2% likely)."
  },
  {
    id: "em-2026-orbital-compute-launch-q3-2027",
    speaker: "Elon Musk",
    claim: "We expect to start launching the first Star Mind computers, which we've co-designed with Nvidia, probably… in the third quarter of next year.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "33:29",
    deadline: "2027-09-30",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About space-based AI computers. \"Star Mind\" is spelled as in the auto-generated transcript; the official spelling is not confirmed. He added \"I'm just guessing here\"."
  },
  {
    id: "em-2026-orbital-compute-volume-2028",
    speaker: "Elon Musk",
    claim: "We'll start off slow, but then it will ramp to significant volume probably in '28, and then very, very large volume in '29.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "33:45",
    deadline: "2028-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Continues the statement about space-based AI computers. Checked against the 2028 part; \"significant volume\" has no number attached."
  },
  {
    id: "em-2026-orbit-cheaper-than-air-freight",
    speaker: "Elon Musk",
    claim: "Probably within, say, 2 or 3 years the cost of a ton to orbit will be less than the cost of air freight from California to Australia.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "35:49",
    deadline: "2029-11-06",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About Starship launch cost per ton. Deadline: \"2 or 3 years\" read as three years from the video's publication date."
  },
  {
    id: "em-2026-starlink-bandwidth-100x",
    speaker: "Elon Musk",
    claim: "The amount of bandwidth that Starlink will produce in two or 3 years will be 100 times more bandwidth than it currently offers.",
    said_on: "2026-11-06",
    source_url: "https://www.youtube.com/watch?v=IjWbvz95w08",
    source_time: "49:40",
    deadline: "2029-11-06",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About total Starlink network capacity, with V3 satellites. Deadline: \"two or 3 years\" read as three years from the video's publication date."
  },
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
  },

  // Source: "Elon Musk: A future worth getting excited about | Tesla Texas Gigafactory interview | TED", YouTube, published 2022-04-18.
  // Recorded at Giga Texas the day before it opened, per the interview.
  {
    id: "em-2022-fsd-solved-this-year",
    speaker: "Elon Musk",
    chain: "fsd-driverless",
    claim: "I actually am confident that we will solve it this year… The probability of an accident, at what point do you exceed that of the average person? I think we will exceed that this year.",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "12:27",
    deadline: "2022-12-31",
    status: "not_happened",
    evidence_url: "https://insideevs.com/news/618181/musk-tesla-fsd-regulator-approval-2022/",
    checked_on: "2026-11-08",
    notes: "In October 2022 Musk said FSD would not get regulatory approval to operate without a driver that year. The source covers approval, not crash statistics."
  },
  {
    id: "em-2022-optimus-prototype-this-year",
    speaker: "Elon Musk",
    chain: "optimus-prototype",
    claim: "I think we'll have like an interesting prototype sometime this year.",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "25:10",
    deadline: "2022-12-31",
    status: "happened",
    evidence_url: "https://www.designboom.com/technology/tesla-ai-day-2022-optimus-bot-prototype-demo-10-03-2022/",
    checked_on: "2026-11-08",
    notes: "Tesla showed an Optimus humanoid prototype at AI Day on September 30, 2022."
  },
  {
    id: "em-2022-optimus-useful-two-years",
    speaker: "Elon Musk",
    claim: "We might have something useful next year, but I think quite likely within at least two years.",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "25:15",
    deadline: "2024-04-18",
    status: "partial",
    evidence_url: "https://www.teslarati.com/tesla-optimus-sorting-battery-cells/",
    checked_on: "2026-11-08",
    notes: "On May 5, 2024, 17 days after the deadline, Tesla posted a video of Optimus sorting battery cells on its own; the claim comes from Tesla, with no independent check. Deadline is two years after publication."
  },
  {
    id: "em-2022-giga-texas-100gwh",
    speaker: "Elon Musk",
    claim: "Asked about the goal of producing 100 gigawatt hours of batteries a year at Giga Texas: \"We will probably do more than that, but yes, hopefully we get there within a couple of years.\"",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "5:28",
    deadline: "2024-04-18",
    status: "not_happened",
    evidence_url: "https://insideevs.com/news/713173/tesla-texas-4680-battery-production-record/",
    checked_on: "2026-11-08",
    notes: "In March 2024 InsideEVs estimated Giga Texas 4680 cell output at a little over 6 GWh a year, based on Tesla's Cybertruck figure; Tesla gave no official rate. Deadline: \"a couple of years\" read as two years."
  },
  {
    id: "em-2022-neuralink-human-implant-this-year",
    speaker: "Elon Musk",
    claim: "We have put in our FDA application to aspirationally do the first human implant this year.",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "32:14",
    deadline: "2022-12-31",
    status: "partial",
    evidence_url: "https://pbs.org/newshour/science/elon-musk-says-the-first-human-has-received-an-implant-from-neuralink-but-details-are-scant",
    checked_on: "2026-11-08",
    notes: "It happened late: the first human implant came at the end of January 2024, about a year after the deadline. He called the timeline aspirational."
  },
  {
    id: "em-2022-starship-orbital-few-months",
    speaker: "Elon Musk",
    claim: "It's looking promising for us to have an orbital launch attempt in a few months… assuming we get regulatory approval, I think we could have an orbital launch attempt within a few months.",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "42:35",
    deadline: "2022-10-18",
    status: "partial",
    evidence_url: "https://en.wikipedia.org/wiki/Starship_flight_test_1",
    checked_on: "2026-11-08",
    notes: "It happened late: the first full Starship flight test launched on April 20, 2023 and was destroyed before reaching orbit. He made the timeline depend on regulatory approval. Deadline: \"a few months\" read as six months."
  },
  {
    id: "em-2022-home-robot-under-10y",
    speaker: "Elon Musk",
    claim: "Asked when people could buy a humanoid robot for home, for their parents for Christmas: \"I'd say in less than ten years.\"",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "25:39",
    deadline: "2032-04-18",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is ten years after the video's publication date."
  },
  {
    id: "em-2022-neuralink-injuries-decade",
    speaker: "Elon Musk",
    claim: "For many years, we will just be solving brain injuries and spinal injuries. For probably a decade.",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "33:07",
    deadline: "2032-04-18",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "About when a high-bandwidth interface for AI-human symbiosis could exist. Deadline is ten years after the video's publication date."
  },
  {
    id: "em-2022-buddy-robot-2050",
    speaker: "Elon Musk",
    claim: "Asked whether by 2050 there will be a robot in most homes: \"Yeah, you'll have your sort of buddy robot probably, yeah.\"",
    said_on: "2022-04-18",
    source_url: "https://www.youtube.com/watch?v=YRvf00NooN8",
    source_time: "24:17",
    deadline: "2050-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "The year 2050 comes from the interviewer's question."
  },

  // Source: "Elon Musk: The future we're building -- and boring | TED", YouTube, published 2017-05-03.
  {
    id: "em-2017-model3-production-july",
    speaker: "Elon Musk",
    claim: "Yeah, it's looking quite good for starting production in July.",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "13:34",
    deadline: "2017-07-31",
    status: "happened",
    evidence_url: "https://en.wikipedia.org/wiki/Tesla_Model_3",
    checked_on: "2026-11-08",
    notes: "Limited Model 3 production began in July 2017."
  },
  {
    id: "em-2017-la-ny-autonomous-2017",
    speaker: "Elon Musk",
    chain: "fsd-driverless",
    claim: "I think we're still on track for being able to go cross-country from LA to New York by the end of the year, fully autonomous… no controls touched at any point during the entire journey.",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "15:08",
    deadline: "2017-12-31",
    status: "not_happened",
    evidence_url: "https://www.ttnews.com/articles/autonomous-coast-coast-tesla-trip-past-deadline-still-coming",
    checked_on: "2026-11-08",
    notes: "In February 2018 Tesla confirmed the drive had not happened; Musk said it would have needed too much specialized code. A later supervised FSD trip reported by fans does not count as fully autonomous."
  },
  {
    id: "em-2017-sleep-in-car-two-years",
    speaker: "Elon Musk",
    chain: "fsd-driverless",
    claim: "Asked, leaving regulation aside, how far away it is to buy a Tesla, take your hands off the wheel, go to sleep and arrive safely: \"I think that's about two years.\"",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "16:55",
    deadline: "2019-05-03",
    status: "not_happened",
    evidence_url: "https://hackaday.com/2020/10/23/tesla-begins-full-self-driving-public-beta-as-waymo-and-cruise-go-unattended",
    checked_on: "2026-11-08",
    notes: "In October 2020 Full Self-Driving was still a beta in which the driver had to pay attention and be ready to take over at all times. Deadline is two years after publication."
  },
  {
    id: "em-2017-solar-roof-two-more-styles",
    speaker: "Elon Musk",
    claim: "We're starting off with two, two initially, and the second two will be introduced early next year.",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "24:43",
    deadline: "2018-06-30",
    status: "not_happened",
    evidence_url: "https://www.teslarati.com/tesla-solar-roof-slate-tuscan-tiles-video/",
    checked_on: "2026-11-08",
    notes: "About the four solar roof tile styles. As of April 2021, Solar Roof installations used only Textured tiles. Deadline: \"early next year\" read as the first half of 2018."
  },
  {
    id: "em-2017-gigafactory-locations-2017",
    speaker: "Elon Musk",
    claim: "I think we'll announce locations for somewhere between two and four Gigafactories later this year. Yeah, probably four.",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "28:25",
    deadline: "2017-12-31",
    status: "partial",
    evidence_url: "https://en.wikipedia.org/wiki/Gigafactory_Shanghai",
    checked_on: "2026-11-08",
    notes: "It happened late: the first new location, Shanghai, was agreed in July 2018. No 2017 announcement was found."
  },
  {
    id: "em-2017-mars-ship-boarding-8-10y",
    speaker: "Elon Musk",
    chain: "humans-to-mars",
    claim: "Asked when people will be walking into the Interplanetary Transport System rocket: \"I'm hopeful it's sort of an eight- to 10-year time frame. Aspirationally, that's our target.\"",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "34:06",
    deadline: "2027-05-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is the upper end, ten years after publication."
  },
  {
    id: "em-2017-solar-roofs-common-15y",
    speaker: "Elon Musk",
    claim: "If you say were to fast-forward to say 15 years from now, it will be unusual to have a roof that does not have solar.",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "25:23",
    deadline: "2032-05-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is fifteen years after publication."
  },
  {
    id: "em-2017-almost-all-houses-solar-50y",
    speaker: "Elon Musk",
    claim: "I think eventually almost all houses will have a solar roof… probably on the order of 40 or 50 years.",
    said_on: "2017-05-03",
    source_url: "https://www.youtube.com/watch?v=zIwLWfaAg-8",
    source_time: "25:07",
    deadline: "2067-05-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is the upper end, fifty years after publication."
  },

  // Source: "Joe Rogan Experience #2422 - Jensen Huang", YouTube, 2025-12-03.
  {
    id: "jh-2025-ai-generated-knowledge-90pct",
    speaker: "Jensen Huang",
    claim: "In the future, in a couple of years, maybe two or three years, 90% of the world's knowledge will likely be generated by AI.",
    said_on: "2025-12-03",
    source_url: "https://www.youtube.com/watch?v=3hptKYix4X8",
    source_time: "37:25",
    deadline: "2028-12-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is the upper end, three years after publication. There is no agreed way to measure the share of the world's knowledge generated by AI."
  },
  {
    id: "jh-2025-small-nuclear-reactors-7y",
    speaker: "Jensen Huang",
    claim: "I think in the next six, seven years, I think you're going to see a whole bunch of small nuclear reactors.",
    said_on: "2025-12-03",
    source_url: "https://www.youtube.com/watch?v=3hptKYix4X8",
    source_time: "1:00:50",
    deadline: "2032-12-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "He describes them as \"hundreds of megawatts\" and agrees they would sit with the companies that use them. Deadline is the upper end, seven years after publication."
  },
  {
    id: "jh-2025-ai-energy-minuscule-10y",
    speaker: "Jensen Huang",
    claim: "In 10 years time the amount of energy necessary for artificial intelligence for most people will be minuscule, utterly minuscule.",
    said_on: "2025-12-03",
    source_url: "https://www.youtube.com/watch?v=3hptKYix4X8",
    source_time: "59:57",
    deadline: "2035-12-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is ten years after publication. \"Minuscule\" has no defined threshold."
  },
  {
    id: "jh-2025-technology-divide-collapses",
    speaker: "Jensen Huang",
    claim: "In the next several years, call it 5 to 10 years… One of the things that I believe is that the technology divide will be substantially collapsed.",
    said_on: "2025-12-03",
    source_url: "https://www.youtube.com/watch?v=3hptKYix4X8",
    source_time: "53:06",
    deadline: "2035-12-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "He hedges it himself: \"I believe and hope… I say hope because I'm not sure.\" Deadline is the upper end, ten years after publication."
  },
  {
    id: "jh-2025-phone-runs-ai-few-years",
    speaker: "Jensen Huang",
    claim: "Your phone's going to run AI just fine all by itself, you know, in a few years.",
    said_on: "2025-12-03",
    source_url: "https://www.youtube.com/watch?v=3hptKYix4X8",
    source_time: "55:13",
    deadline: "2028-12-03",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "He adds that phones already do it \"fairly decently\". Deadline: \"a few years\" read as three years."
  },

  // Source: "Nvidia CEO Jensen Huang gives a keynote address at the GTC conference in Washington", YouTube, 2025-10-28.
  {
    id: "jh-2025-rubin-production-next-year",
    speaker: "Jensen Huang",
    claim: "While we're shipping GB300s, we're preparing Rubin to be in production, you know, this time next year, maybe slightly earlier.",
    said_on: "2025-10-28",
    source_url: "https://www.youtube.com/watch?v=xDjbj_sLy_s",
    source_time: "1:04:36",
    deadline: "2026-10-28",
    status: "happened",
    evidence_url: "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Vera-Rubin-Ramps-Into-Full-Production-to-Power-Agentic-AI-Factories-Worldwide/default.aspx",
    checked_on: "2026-11-08",
    notes: "On May 31, 2026, ahead of the deadline, Nvidia announced that Vera Rubin was ramping into full production, with shipments to start that fall. The evidence is Nvidia's own press release."
  },
  {
    id: "jh-2025-half-trillion-blackwell-rubin-2026",
    speaker: "Jensen Huang",
    claim: "We're probably the first technology company in history to have visibility into half a trillion dollars of cumulative Blackwell and early ramps of Rubin through 2026.",
    said_on: "2025-10-28",
    source_url: "https://www.youtube.com/watch?v=xDjbj_sLy_s",
    source_time: "57:01",
    deadline: "2026-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "\"Visibility\" refers to business already on the books, not revenue. He says the figure excludes China. Can be checked against Nvidia's results for the quarter ending in early 2027."
  },

  // Source: "Jensen Huang: NVIDIA - The $4 Trillion Company & the AI Revolution | Lex Fridman Podcast #494", YouTube, 2026-03-23.
  {
    id: "jh-2026-biological-machine-5y",
    speaker: "Jensen Huang",
    claim: "Understanding the biological machine is right around the corner. It's not 10 years. It's five years probably.",
    said_on: "2026-03-23",
    source_url: "https://www.youtube.com/watch?v=vif8NQcjVf0",
    source_time: "2:24:12",
    deadline: "2031-03-23",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is five years after publication. \"Understanding the biological machine\" has no clear test, so the outcome will be hard to judge."
  },

  // Source: "NVIDIA CEO Jensen Huang's Vision for the Future" (Huge If True), YouTube, 2025-01-27.
  {
    id: "jh-2025-superhuman-intelligence-decade",
    speaker: "Jensen Huang",
    claim: "The next decade intelligence, not for everything but for some things, would basically become superhuman.",
    said_on: "2025-01-27",
    source_url: "https://www.youtube.com/watch?v=7ARBJQn6QkM",
    source_time: "50:13",
    deadline: "2035-01-27",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is ten years after publication. He does not say which things or what counts as superhuman."
  },
  {
    id: "jh-2025-look-back-few-years",
    speaker: "Jensen Huang",
    claim: "When we look back in a few years… the whole field of digital biology and life sciences has been transformed. Our whole understanding of material sciences has completely been revolutionized. That robots are helping us do dangerous and mundane things all over the place. That if we wanted to drive we can drive but otherwise… take a nap…",
    said_on: "2025-01-27",
    source_url: "https://www.youtube.com/watch?v=7ARBJQn6QkM",
    source_time: "1:01:40",
    deadline: "2028-01-27",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "He frames it as a hope (\"I do hope\") and it bundles several claims, so a partial outcome is possible. Deadline: \"a few years\" read as three years."
  },

  // Source: "Elon Musk: SpaceX, Mars, Tesla Autopilot, Self-Driving, Robotics, and AI | Lex Fridman Podcast #252", YouTube, 2021-12-28.
  {
    id: "em-2021-fsd-level4-next-year",
    speaker: "Elon Musk",
    chain: "fsd-driverless",
    claim: "Asked when Tesla will solve level four FSD: \"I mean, it's looking quite likely that it'll be next year.\"",
    said_on: "2021-12-28",
    source_url: "https://www.youtube.com/watch?v=DxREm3s1scA",
    source_time: "1:27:01",
    deadline: "2022-12-31",
    status: "not_happened",
    evidence_url: "https://insideevs.com/news/618181/musk-tesla-fsd-regulator-approval-2022/",
    checked_on: "2026-11-08",
    notes: "At 1:28:15 he adds \"it certainly appears like we will get there next year\". In October 2022 Musk said FSD would not get regulatory approval to operate without a driver that year."
  },
  {
    id: "em-2021-optimus-prototype-next-year",
    speaker: "Elon Musk",
    chain: "optimus-prototype",
    claim: "We'll probably have, I don't know, a decent prototype towards the end of next year or something like that.",
    said_on: "2021-12-28",
    source_url: "https://www.youtube.com/watch?v=DxREm3s1scA",
    source_time: "1:46:06",
    deadline: "2022-12-31",
    status: "happened",
    evidence_url: "https://www.designboom.com/technology/tesla-ai-day-2022-optimus-bot-prototype-demo-10-03-2022/",
    checked_on: "2026-11-08",
    notes: "About the Tesla Bot (Optimus). Tesla showed a prototype at AI Day on September 30, 2022."
  },
  {
    id: "em-2021-human-on-mars-5-10y",
    speaker: "Elon Musk",
    chain: "humans-to-mars",
    claim: "Asked when SpaceX will land a human being on Mars: \"Best case is about five years, worst case 10 years.\"",
    said_on: "2021-12-28",
    source_url: "https://www.youtube.com/watch?v=DxREm3s1scA",
    source_time: "27:43",
    deadline: "2031-12-28",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "Deadline is the worst case, ten years after publication. The best case, five years, ends on 2026-12-28."
  },

  // Source: "Joe Rogan Experience #2255 - Mark Zuckerberg", YouTube, 2025-01-10.
  {
    id: "mz-2025-ai-midlevel-engineer-2025",
    speaker: "Mark Zuckerberg",
    claim: "I think this year probably in 2025 we at Meta as well as the other companies that are basically working on this are going to have an AI that can effectively be a sort of mid-level engineer that you have at your company that can write code.",
    said_on: "2025-01-10",
    source_url: "https://www.youtube.com/watch?v=7k1ehaE0bdU",
    source_time: "2:08:11",
    deadline: "2025-12-31",
    status: "pending",
    evidence_url: "",
    checked_on: "2026-11-08",
    notes: "No reliable public evidence of the outcome was found as of the check date. \"Mid-level engineer\" has no agreed test. He adds that it would be expensive to run at first."
  }
];
